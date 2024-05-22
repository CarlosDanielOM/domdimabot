const express = require('express');
const router = express.Router();

const commandSchema = require('../../schemas/command');
const STREAMERS = require('../../class/streamers');


router.post('/:channelID/song-request', async (req, res) => {
    let body = req.body;
    const { channelID } = req.params;

    let streamer = await STREAMERS.getStreamerById(channelID);
    if(!streamer) return res.status(404).json({error: true, message: 'Streamer not found'});

    let exists = await commandSchema.exists({cmd: 'ssr', channelID});
    if(exists) return res.json({error: true, message: 'Command already exists'});
    
    let command = new commandSchema({
        name: 'Song Request',
        cmd: 'ssr',
        func: 'songRequest',
        channelID,
        channel: streamer.name,
        userLevelName: 'everyone',
        userLevel: 0,
        enabled: true,
        description: 'Request a song to play in the stream.',
        cooldown: 10,
        type: 'command',
        reserved: true,
        message: 'Song request sent!',
    });

    await command.save();
});

module.exports = router;