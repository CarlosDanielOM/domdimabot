const express = require('express');
const router = express.Router();

const accountSchema = require('../../../schemas/accounts');
const crypto = require('../../../util/crypto');
const {getSpotifyURL} = require('../../../util/links');

router.get('/queue', async (req, res) => {
    let channelID = req.query.channelID;

    let account = await accountSchema.findOne({channelID, user_type: 'spotify'});
    if(!account) return res.status(404).json({error: true, message: 'Account not found'});

    let access_token = crypto.decrypt(account.user_token);

    let response = await fetch(`${getSpotifyURL()}/me/player/queue`, {
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    });

    let data = await response.json();

    if(data.error) {
        return res.status(400).json({error: true, message: data.message});
    }

    let queue = [];

    let songs = data.queue;
    songs.forEach(song => {
        let song_name = song.name;
        let song_artist = song.artists[0].name;
        queue.push({song_name, song_artist});
    })

    return res.json({error: false, queue, message: 'Queue fetched successfully'});
    
})

module.exports = router;