require('dotenv').config();
const express = require('express');
const router = express.Router();

const STREAMERS = require('../../class/streamers');
const {getTwitchHelixURL} = require('../../util/links')
const {decrypt} = require('../../util/crypto')
const {unsubscribeTwitchEvent, subscribeTwitchEvent} = require('../../util/eventsub')

const rewardSchema = require('../../schemas/redemptionreward')

router.get('/:channelID', async (req, res) => {
    const { channelID } = req.params;

    let rewards = await rewardSchema.find({ channelID: channelID }, '_id rewardID rewardTitle rewardPrompt rewardCost rewardCostChange rewardMessage returnToOriginalCost rewardIsEnabled skipQueue rewardType cooldown');

    res.status(200).json({ rewards });
});

router.get('/:channelID/:type', async (req, res) => {
    const { type, channelID } = req.params;

    let rewards = await rewardSchema.find({ channelID: channelID, rewardType: type }, '_id rewardID rewardTitle rewardPrompt rewardCost rewardCostChange rewardMessage returnToOriginalCost rewardIsEnabled skipQueue rewardType cooldown');

    res.status(200).json({ rewards });
});

router.post('/:channelID', async (req, res) => {
    const { channelID } = req.params;
    let body = req.body;

    const streamer = await STREAMERS.getStreamerById(channelID);
    if(!streamer) return res.status(404).json({error: true, message: 'Streamer not found'});

    if(!body.title || !body.cost ) return res.status(400).json({error: true, message: 'Missing required fields'});
    
    if(body.title > 45) return res.status(400).json({error: true, message: 'Title too long'});

    let twitchBody = body;
    if(body.skipQueue) twitchBody.should_redemptions_skip_request_queue = body.skipQueue;
    if(body.cooldown && body.cooldown > 0) {
        twitchBody.is_global_cooldown_enabled = true;
        twitchBody.global_cooldown_seconds = body.cooldown;
    } else {
        twitchBody.is_global_cooldown_enabled = false;
        twitchBody.global_cooldown_seconds = 0;
    }
    if(body.userInput) twitchBody.is_user_input_required = body.userInput;
    
    let response = await fetch(`${getTwitchHelixURL()}/channel_points/custom_rewards?broadcaster_id=${channelID}`, {
        method: 'POST',
        headers: {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${decrypt(streamer.token)}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(twitchBody)
    })

    let results = await response.json();
    if(results.error) {
        console.log({error: true, message: 'Error creating reward', response: results, channelID});
        return res.status(response.status).json({error: true, message: results.message});
    }

    let newReward = results.data[0];

    const evensubData = await subscribeTwitchEvent(channelID, 'channel.channel_points_custom_reward_redemption.add', '1', {broadcaster_user_id: channelID, reward_id: newReward.id});

    const priceIncrease = body.priceIncrease ? body.priceIncrease : 0;
    const rewardMessage = body.message ? body.message : '';
    const returnToOriginalCost = body.returnToOriginalCost ? body.returnToOriginalCost : false;

    let rewardData = {
        eventsubID: evensubData.id,
        channelID: channelID,
        channel: streamer.name,
        rewardID: newReward.id,
        rewardTitle: newReward.title,
        rewardPrompt: newReward.prompt,
        rewardOriginalCost: newReward.cost,
        rewardCost: newReward.cost,
        rewardIsEnabled: newReward.is_enabled,
        rewardCostChange: priceIncrease,
        rewardMessage: rewardMessage,
        returnToOriginalCost: returnToOriginalCost,
        cooldown: body.cooldown ? body.cooldown : 0,
    }

    if(body.rewardType) rewardData.rewardType = body.rewardType;
    if(body.rewardDuration) rewardData.rewardDuration = body.rewardDuration;

    if(body.rewardDuration > 90) return res.status(400).json({error: true, message: 'Duration should not exceed 90 days'});

    let dbReward = new rewardSchema(rewardData);
    await dbReward.save();

    res.status(200).json({error: false, message: 'Reward created successfully', reward: dbReward, rewardData});
    
});

router.delete('/channelID/:rewardID', async (req, res) => {
    const {channelID, rewardID} = req.params;

    let reward = await rewardSchema.findOne({channelID: channelID, _id: rewardID});
    if(!reward) return res.status(404).json({error: true, message: 'Reward not found'});

    let streamer = await STREAMERS.getStreamerById(channelID);

    let response = await fetch(`${getTwitchHelixURL()}/channel_points/custom_rewards?broadcaster_id=${channelID}&id=${rewardID}`, {
        method: 'DELETE',
        headers: {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${decrypt(streamer.token)}`
        }
    });

    if(response.error) {
        console.log({error: true, message: 'Error deleting reward', response: response, channelID});
        return res.status(response.status).json({error: true, message: 'Error deleting reward'});
    }

    if(response.status !== 204) {
        console.log({error: true, message: 'Error deleting reward', response: response, channelID});
        return res.status(response.status).json({error: true, message: 'Error deleting reward'});
    }

    await unsubscribeTwitchEvent(reward.eventsubID);

    await reward.deleteOne();

    res.status(200).json({error: false, message: 'Reward deleted successfully'});

    
});

router.patch('/channelID/:rewardID', async (req, res) => {
    const {channelID, rewardID} = req.params;
    let body = req.body;

    const streamer = await STREAMERS.getStreamerById(channelID);

    let reward = await rewardSchema.findOne({channelID: channelID, _id: rewardID});
    if(!reward) return res.status(404).json({error: true, message: 'Reward not found'});

    let twitchBody = body;
    if(body.skipQueue) twitchBody.should_redemptions_skip_request_queue = body.skipQueue;
    if(body.cooldown && body.cooldown > 0) {
        twitchBody.is_global_cooldown_enabled = true;
        twitchBody.global_cooldown_seconds = body.cooldown;
    } else {
        twitchBody.is_global_cooldown_enabled = false;
        twitchBody.global_cooldown_seconds = 0;
    }

    let response = await fetch(`${getTwitchHelixURL()}/channel_points/custom_rewards?broadcaster_id=${channelID}&id=${rewardID}`, {
        method: 'PATCH',
        headers: {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${decrypt(streamer.token)}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(twitchBody)
    })

    if(response.status !== 200) return res.status(response.status).json({error: true, message: 'Error updating reward'});

    if(body.title) body.rewardTitle = body.title;
    if(body.prompt) body.rewardPrompt = body.prompt;
    if(body.cost) body.rewardCost = body.cost;
    if(body.priceIncrease) body.rewardCostChange = body.priceIncrease;
    if(body.message) body.rewardMessage = body.message;
    if(body.isEnabled) body.rewardIsEnabled = body.isEnabled;
    delete body.title;
    delete body.prompt;
    delete body.cost;
    delete body.priceIncrease;
    delete body.message;
    delete body._id;
    delete body.isEnabled;

    delete body.is_global_cooldown_enabled;
    delete body.global_cooldown_seconds;

    let updated = await reward.updateOne(body, {new: true});

    res.status(200).json({error: false, message: 'Reward updated successfully', reward: updated});
    
});

module.exports = router;