const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const eventsubSchema = require('../../schemas/eventsub');

const STREAMERS = require('../../class/streamers');

const {unsubscribeTwitchEvent, subscribeTwitchEvent} = require('../../util/eventsub');

router.get('/:channelID', async (req, res) => {
    const { channelID } = req.params;

    let data = await eventsubSchema.find({ channelID: channelID }, '_id type version condition channelID enabled message endEnabled endMessage minViewers');

    res.status(200).json(data);
});

router.get('/single/:id', async (req, res) => {
    const { id } = req.params;

    if(!id) return res.status(400).json({ message: 'No id provided', error: true });
    if(!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id', error: true });

    let data = await eventsubSchema.findById(id, '_id type version condition channelID enabled message endEnabled endMessage minViewers');

    if(!data) return res.status(404).json({ message: 'Eventsub not found', error: true });

    res.status(200).json({eventsub: data, error: false});
});

router.get('/:channelID/:type', async (req, res) => {
    const { channelID, type } = req.params;

    let data = await eventsubSchema.findOne({ channelID: channelID, type: type }, '_id type version condition channelID enabled message endEnabled endMessage minViewers');

    if(!data) return res.status(404).json({ message: 'Eventsub not found', error: true });

    res.status(200).json({eventsubs: data, error: false});
});

router.post('/:channelID', async (req, res) => {
    const { channelID } = req.params;
    const { type, version, condition } = req.body;

    let streamer = await STREAMERS.getStreamerById(channelID);

    if(!streamer) return res.status(404).json({ message: 'Streamer not found', error: true });

    let response = await subscribeTwitchEvent(channelID, type, version, condition);

    let newEventsubData = await eventsubSchema.findOne({ channelID: channelID, type: type });

    res.status(200).json({error: false, message: 'Eventsub created', eventsub: newEventsubData, response});
});

router.delete('/:channelID/:id', async (req, res) => {
    const { channelID, id } = req.params;

    let eventsub = await eventsubSchema.findOne({ channelID: channelID, _id: id });

    if(!eventsub) return res.status(404).json({ message: 'Eventsub not found', error: true });

    let result = await unsubscribeTwitchEvent(eventsub.id);

    if(result.error) return res.status(result.status).json(result);

    return res.status(200).json({error: false, message: 'Eventsub deleted'});

});

router.patch('/:channelID/:id', async (req, res) => {
    const { channelID, id } = req.params;
    let body = req.body;

    let eventsub = await eventsubSchema.findOne({ channelID, _id: id});

    if(!eventsub) return res.status(404).json({ message: 'Eventsub not found', error: true });

    let update = await eventsubSchema.findOneAndUpdate({ channelID, _id: id}, body, { new: true });

    if(!update) return res.status(400).json({ message: 'Error updating eventsub', error: true });

    res.status(200).json({ message: 'Eventsub updated', error: false, eventsub: update });

});

module.exports = router;