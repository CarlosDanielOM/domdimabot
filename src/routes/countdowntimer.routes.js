const express = require('express');
const router = express.Router();

const countdowntimerSchema = require('../../schemas/countdowntimer');
const countdowntimerconfigSchema = require('../../schemas/countdowntimerconfig');

const STREAMERS = require('../../class/streamers');

const htmlPath = `${__dirname}/public/`;

router.get('/:channel', async (req, res) => {
    res.sendFile(`${htmlPath}countdowntimer.html`);
});

router.get('/:channelID/timer', async (req, res) => {});

router.post('/:channelID/timer', async (req, res) => {
    const { channelID } = req.params;
    let body = req.body;

    const streamer = await STREAMERS.getStreamerById(channelID);

    if (!streamer) {
        return res.status(404).json({ error: true, message: 'Streamer not found' });
    }

    const timerExists = await countdowntimerSchema.findOne({ channelID, active: true });
    if(timerExists) {
        return res.status(400).json({ error: true, message: 'An active timer already exists' });
    }

    const timer = new countdowntimerSchema({
        channel: streamer.name,
        channelID: channelID,
        startTime: body.startTime,
        time: body.startTime,
        paused: true
    });

    await timer.save();

    return res.status(200).json({ error: false, message: 'Timer created' });
});

router.patch('/:channelID/timer', async (req, res) => {});

router.get('/:channelID/config', async (req, res) => {});

router.post('/:channelID/config', async (req, res) => {
    const { channelID } = req.params;
    let body = req.body;
    const { bits, tier1, tier2, tier3, follows, raids, viewers, donations } = body;
    
    const streamer = await STREAMERS.getStreamerById(channelID);

    if (!streamer) {
        return res.status(404).json({ error: true, message: 'Streamer not found' });
    }

    const configExists = await countdowntimerconfigSchema.findOne({ channelID });

    if (configExists) {
        return res.status(400).json({ error: true, message: 'Config already exists' });
    }
    
    const config = new countdowntimerconfigSchema({
        channel: streamer.name,
        channelID: channelID,
        bits,
        tier1,
        tier2,
        tier3,
        follows,
        raids,
        viewers,
        donations,
    });

    await config.save();

    return res.status(200).json({ error: false, message: 'Config created' });
    
});

router.patch('/:channelID/config', async (req, res) => {
    const { channelID } = req.params;
    let body = req.body;
    
    const streamer = await STREAMERS.getStreamerById(channelID);

    if (!streamer) {
        return res.status(404).json({ error: true, message: 'Streamer not found' });
    }

    const config = await countdowntimerconfigSchema.findOne({ channelID });

    if (!config) {
        return res.status(404).json({ error: true, message: 'Config not found' });
    }

    await config.updateOne(body);

    return res.status(200).json({ error: false, message: 'Config updated' });
    
});

module.exports = router;