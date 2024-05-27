const express = require('express');
const router = express.Router();
const { getSpotifyURL, getSpotifyAuthURL } = require('../../../util/links')

const crypto = require('../../../util/crypto');
const channelSchema = require('../../../schemas/channel.schema');
const accountSchema = require('../../../schemas/accounts');

router.get('/find', async (req, res) => {
    let query = req.query;
    let song = query.song;
    let channelID = query.channelID;

    let account = await accountSchema.findOne({channelID, user_type: 'spotify'});
    if(!account) return res.status(404).json({error: true, message: 'Account not found'});

    let access_token = crypto.decrypt(account.user_token);

    console.log({access_token, song, channelID})

    let response = await fetch(`${getSpotifyURL()}/search?q=${encodeURIComponent(song)}&type=track`, {
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        }
    });

    console.log({response: await response.text()});

    if(response.status == 403) {
        return res.status(403).json({error: true, message: 'Forbidden'});
    }
    
    let data = await response.json();

    if(data.error) {
        return res.status(400).json({error: true, message: data.message});
    }

    let items = data.tracks.items;
    let song_name = items[0].name;
    let song_artist = items[0].artists[0].name;
    let song_uri = items[0].uri;

    return res.json({error: false, song_uri, song_name, song_artist});
})

router.post('/queue', async (req, res) => {
    let body = req.body;
    let channelID = body.channelID;
    let song = body.song;

    let account = await accountSchema.findOne({channelID, user_type: 'spotify'});
    if(!account) return res.status(404).json({error: true, message: 'Account not found'});

    let access_token = crypto.decrypt(account.user_token);

    let findSongResponse = await fetch(`http://localhost:3434/song/find?song=${song}&channelID=${channelID}`);

    console.log({findSongResponse, where: 'spotify/song.routes.js'});

    let songData = await findSongResponse.json();

    if(songData.error) return res.status(400).json({error: true, message: songData.message});

    let song_uri = songData.song_uri;
    song_uri = encodeURIComponent(song_uri);

    let response = await fetch(`${getSpotifyURL()}/me/player/queue?uri=${song_uri}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        }
    });
    
    if(response.status == 204) return res.json({error: false, message: 'Song queued'});
    
    console.log({response});
    
    let data = await response.json();
    
    if(data.error) {
        return res.status(400).json({error: true, message: data.error.message});
    }
})

router.post('/play', async (req, res) => {
    let body = req.body;
    let channelID = body.channelID;

    let account = await accountSchema.findOne({channelID, user_type: 'spotify'});
    if(!account) return res.status(404).json({error: true, message: 'Account not found'});

    let access_token = crypto.decrypt(account.user_token);

    let response = await fetch(`${getSpotifyURL()}/me/player/play`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        }
    });

    if(response.status == 204) return res.json({error: false, message: 'Song played'});

    let data = await response.json();

    if(data.error) {
        return res.status(400).json({error: true, message: data.error.message});
    }
});

router.post('/pause', async (req, res) => {
    let body = req.body;
    let channelID = body.channelID;

    let account = await accountSchema.findOne({channelID, user_type: 'spotify'});
    if(!account) return res.status(404).json({error: true, message: 'Account not found'});

    let access_token = crypto.decrypt(account.user_token);

    let response = await fetch(`${getSpotifyURL()}/me/player/pause`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        }
    });

    if(response.status == 204) return res.json({error: false, message: 'Song paused'});

    let data = await response.json();

    if(data.error) {
        return res.status(400).json({error: true, message: data.error.message});
    }
    
});

router.post('/skip', async (req, res) => {
    let body = req.body;
    let channelID = body.channelID;

    let account = await accountSchema.findOne({channelID, user_type: 'spotify'});
    if(!account) return res.status(404).json({error: true, message: 'Account not found'});

    let access_token = crypto.decrypt(account.user_token);

    let response = await fetch(`${getSpotifyURL()}/me/player/next`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        }
    });

    if(response.status == 204) return res.json({error: false, message: 'Song skipped'});

    let data = await response.json();

    if(data.error) {
        return res.status(400).json({error: true, message: data.error.message});
    }
});

module.exports = router;