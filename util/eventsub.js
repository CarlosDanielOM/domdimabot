require('dotenv').config();
const STREAMERS = require('../class/streamers')
const { getStreamerHeader } = require('../util/headers')
const { getTwitchHelixURL } = require('../util/links')
const { getAppToken } = require('../util/token')
const eventsubSchema = require('../schemas/eventsub');

const modID = '698614112';

async function subscribeTwitchEventFollow(channel) {
    let streamer = await STREAMERS.getStreamer(channel);
    let streamerHeaders = await getStreamerHeader(channel);
    let appAccessToken = await getAppToken();

    streamerHeaders['Authorization'] = `Bearer ${appAccessToken}`;

    let response = await fetch(`${getTwitchHelixURL()}/eventsub/subscriptions`, {
        method: 'POST',
        headers: streamerHeaders,
        body: JSON.stringify({
            type: 'channel.follow',
            version: '2',
            condition: {
                broadcaster_user_id: streamer.user_id,
                moderator_user_id: modID
            },
            transport: {
                method: 'webhook',
                callback: 'https://subscriptions.domdimabot.com/eventsub',
                secret: process.env.TWITCH_EVENTSUB_SECRET
            }
        })
    });
    response = await response.json();

    if (response.error) {
        console.log(response.error);
        return response;
    }

    let data = response.data[0];

    let newEventsub = new eventsubSchema({
        id: data.id,
        status: data.status,
        type: data.type,
        version: data.version,
        condition: data.condition,
        created_at: data.created_at,
        transport: data.transport,
        cost: data.cost
    });

    await newEventsub.save();

    return data;

}

async function subscribeTwitchEvents(channel) {

    let streamer = await STREAMERS.getStreamer(channel);
    let streamerHeaders = await getStreamerHeader(channel);
    let appAccessToken = await getAppToken();

    streamerHeaders['Authorization'] = `Bearer ${appAccessToken}`;

    let response = await fetch(`${getTwitchHelixURL()}/eventsub/subscriptions`, {
        method: 'POST',
        headers: streamerHeaders,
        body: JSON.stringify({
            type: 'stream.online',
            version: '1',
            condition: {
                broadcaster_user_id: streamer.user_id
            },
            transport: {
                method: 'webhook',
                callback: 'https://subscriptions.domdimabot.com/eventsub',
                secret: process.env.TWITCH_EVENTSUB_SECRET
            }
        })
    });

    response = await response.json();

    if (response.error) {
        console.log(response.error);
        return response;
    }

    let data = response.data[0];

    let newEventsub = new eventsubSchema({
        id: data.id,
        status: data.status,
        type: data.type,
        version: data.version,
        condition: data.condition,
        created_at: data.created_at,
        transport: data.transport,
        cost: data.cost
    });

    await newEventsub.save();

    return data;

}

async function getEventsub() {
    let appAccessToken = await getAppToken();

    let headers = {
        Authorization: `Bearer ${appAccessToken}`,
        'Client-Id': process.env.CLIENT_ID,
        'Content-Type': 'application/json'
    }

    let response = await fetch(`${getTwitchHelixURL()}/eventsub/subscriptions`, {
        method: 'GET',
        headers
    });

    response = await response.json();

    return response;

}

module.exports = {
    subscribeTwitchEvents,
    getEventsub,
    subscribeTwitchEventFollow
}