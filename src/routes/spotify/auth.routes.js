require('dotenv').config();
const express = require('express');
const router = express.Router();
const { getSpotifyURL, getSpotifyAuthURL } = require('../../../util/links')

const STREAMERS = require('../../../class/streamers');

const crypto = require('../../../util/crypto');
const channelSchema = require('../../../schemas/channel.schema');
const accountSchema = require('../../../schemas/accounts');

router.get('/', async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state ?? null;
    const error = req.query.error || null;
    const grant_type = 'authorization_code';

    if(error) {
        res.redirect(`/#error=${error}`);
    }
    if(!state) res.redirect('/#error=state_not_found');

    let streamer = await STREAMERS.getStreamerById(state);
    if(!streamer) return res.status(404).json({error: true, message: 'Streamer not found'});

    let body = new URLSearchParams({
        code,
        redirect_uri: 'https://spotify.domdimabot.com/auth',
        grant_type
    });

    let response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${new Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: body
    });

    console.log({response, where: 'spotify/auth.routes.js'})

    let data = await response.json();

    if(data.error) {
        return res.status(400).json({error: true, message: data.error_description});
    }

    let user = state;
    let access_token = data.access_token;
    let refresh_token = data.refresh_token;
    let crypto_access_token = crypto.encrypt(access_token);
    let crypto_refresh_token = crypto.encrypt(refresh_token);

    let exists = await accountSchema.exists({channelID: user, user_type: 'spotify'});

    if(exists) return res.json({error: true, message: 'User already exists'})

    let account = new accountSchema({
        channelID: user,
        channelName: streamer.name,
        user_type: 'spotify',
        user_token: crypto_access_token,
        user_refresh_token: crypto_refresh_token
    });

    await account.save();

    let patchUser = await fetch('https://spotify.domdimabot.com/auth?user_id=' + user, {
        method: 'PATCH',
    });

    console.log({patchUser, where: 'spotify/auth.routes.js'})
    
    let patchData = await patchUser.json();
    if(patchData.error) {
        await account.deleteOne({channelID: user, user_type: 'spotify'});
        return res.json({error: true, message: 'creating user failed'})
    };

    res.redirect(`https://domdimabot.com/dashboard?alert=Spotfiy%20Account%20Connected`);

})

router.patch('/', async (req, res) => {
    let userID = req.query.user_id;

    let user = await accountSchema.findOne({channelID: userID, user_type: 'spotify'});

    if(!user) return res.json({error: true, message: 'User not found'});

    let access_token = crypto.decrypt(user.user_token);

    let response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${access_token}`
        },
    });

    console.log({response, where: 'spotify/auth.routes.js patch'})
    
    let data = await response.json();

    user.user_id = data.id;
    user.user_email = data.email;
    user.user_login = data.display_name;

    await user.save();

    res.json({error: false, message: 'Success'});
    
})

router.post('/refresh', async (req, res) => {
    let userID = req.body.user_id;
    const grant_type = 'refresh_token';
    const client_id = process.env.SPOTIFY_CLIENT_ID;

    let account = await accountSchema.findOne({user_id: userID, user_type: 'spotify'});

    if(!account) return res.json({error: true, message: 'User not found'});

    let refresh_token = crypto.decrypt(account.user_refresh_token);

    let response = await fetch(`${getSpotifyAuthURL()}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${new Buffer.from(`${client_id}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
            grant_type,
            refresh_token
        })
    });

    let json = await response.json();

    if(json.error) return res.json({error: true, message: json.error_description});

    let access_token = json.access_token;

    account.user_token = crypto.encrypt(access_token);
    await account.save();

    res.status(200).json({error: false, message: 'Refreshed Token'});
    
});

module.exports = router;