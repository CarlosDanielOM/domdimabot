const express = require('express');
const router = express.Router();

const commandSchema = require('../../schemas/command');
const STREAMERS = require('../../class/streamers');


router.post('/:channelID/song-request', async (req, res) => {
    let body = req.body;
    const { channelID } = req.params;

    let streamer = await STREAMERS.getStreamerById(channelID);
    if(!streamer) return res.status(404).json({error: true, message: 'Streamer not found'});

    let exists = await commandSchema.exists({func: 'spotifySongRequest', channelID});
    if(exists) return res.json({error: true, message: 'Command already exists'});
    
    let command = new commandSchema({
        name: 'Spotify Song Request',
        cmd: 'ssr',
        func: 'spotifySongRequest',
        channelID,
        channel: streamer.name,
        userLevelName: 'everyone',
        userLevel: 1,
        permissions: {
            play: 7,
            pause: 7,
            skip: 7
        },
        enabled: true,
        description: 'Request a song to play in the stream.',
        cooldown: 10,
        type: 'command',
        reserved: true,
        message: 'Song requested!',
    });

    await command.save();

    res.json({error: false, message: 'Command created'});
});

router.delete('/:channelID/song-request', async (req, res) => {
    const { channelID } = req.params;

    let exists = await commandSchema.exists({func: 'spotifySongRequest', channelID});
    if(!exists) return res.json({error: true, message: 'Command not found'});

    await commandSchema.deleteOne({func: 'spotifySongRequest', channelID});
    res.json({error: false, message: 'Command deleted'});
});

router.post('/:channelID/countdown-timer', async (req, res) => {
    let body = req.body;
    const { channelID } = req.params;

    let streamer = await STREAMERS.getStreamerById(channelID);
    if(!streamer) return res.status(404).json({error: true, message: 'Streamer not found'});

    let exists = await commandSchema.exists({func: 'countdownTimer', channelID});
    if(exists) return res.json({error: true, message: 'Command already exists'});
    
    let command = new commandSchema({
        name: 'Countdown Timer',
        cmd: 'timer',
        func: 'countdownTimer',
        channelID,
        channel: streamer.name,
        userLevelName: 'everyone',
        userLevel: 1,
        permissions: {
            start: 7,
            pause: 7,
            resume: 7,
            add: 7
        },
        enabled: true,
        description: 'Start a countdown timer.',
        cooldown: 10,
        type: 'command',
        reserved: true,
        message: 'Countdown timer started!',
    });

    await command.save();

    res.json({error: false, message: 'Command created'});
});

router.delete('/:channelID/countdown-timer', async (req, res) => {
    const { channelID } = req.params;

    let exists = await commandSchema.exists({func: 'countdownTimer', channelID});
    if(!exists) return res.json({error: true, message: 'Command not found'});

    await commandSchema.deleteOne({func: 'countdownTimer', channelID});
    res.json({error: false, message: 'Command deleted'});
});

module.exports = router;