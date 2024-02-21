require('dotenv').config();
const STREAMERS = require('../class/streamers')
const { getStreamerHeader } = require('../util/headers')
const { getTwitchHelixURL } = require('../util/links')
const { getAppToken } = require('../util/token')
const eventsubSchema = require('../schemas/eventsub');

const modID = '698614112';

const SubscritpionsData = [
    {
        type: 'channel.follow',
        version: '2',
        condition: {
            broadcaster_user_id: '698614112',
            moderator_user_id: modID
        }
    },
    {
        type: 'stream.online',
        version: '1',
        condition: {
            broadcaster_user_id: '698614112'
        }
    },
    {
        type: 'stream.offline',
        version: '1',
        condition: {
            broadcaster_user_id: '698614112'
        }
    },
    {
        type: 'channel.raid',
        version: '1',
        condition: {
            to_broadcaster_user_id: '698614112'
        },
    },
    {
        type: 'channel.poll.progress',
        version: '1',
        condition: {
            broadcaster_user_id: '698614112'
        }
    },
    {
        type: 'channel.prediction.progress',
        version: '1',
        condition: {
            broadcaster_user_id: '698614112'
        }
    },
    {
        type: 'channel.hype_train.begin',
        version: '1',
        condition: {
            broadcaster_user_id: '698614112'
        }
    },
    {
        type: 'channel.hype_train.progress',
        version: '1',
        condition: {
            broadcaster_user_id: '698614112'
        }
    },
    {
        type: 'channel.hype_train.end',
        version: '1',
        condition: {
            broadcaster_user_id: '698614112'
        }
    },
    {
        type: 'channel.shoutout.receive',
        version: '1',
        condition: {
            broadcaster_user_id: '698614112',
            moderator_user_id: modID
        }
    },
    {
        type: 'channel.ad_break.begin',
        version: '1',
        condition: {
            broadcaster_user_id: '698614112'
        }
    }
];

async function subscribeTwitchEvent(channel, type, version, condition) {
    let streamer = await STREAMERS.getStreamer(channel);
    let streamerHeaders = await getStreamerHeader(channel);
    let appAccessToken = await getAppToken();

    streamerHeaders['Authorization'] = `Bearer ${appAccessToken}`;

    let response = await fetch(`${getTwitchHelixURL()}/eventsub/subscriptions`, {
        method: 'POST',
        headers: streamerHeaders,
        body: JSON.stringify({
            type: type,
            version: version,
            condition: condition,
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
        cost: data.cost,
        channel: channel,
        channelID: streamer.user_id
    });

    await newEventsub.save();

    return data;
}

async function getEventsubs() {
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

async function unsubscribeTwitchEvent(id) {
    let appAccessToken = await getAppToken();

    let headers = {
        Authorization: `Bearer ${appAccessToken}`,
        'Client-Id': process.env.CLIENT_ID,
        'Content-Type': 'application/json'
    }

    let response = await fetch(`${getTwitchHelixURL()}/eventsub/subscriptions?id=${id}`, {
        method: 'DELETE',
        headers
    });

    if (response.status === 204) {
        await eventsubSchema.deleteOne({ id });
        return response;
    }

    response = await response.json();

    if (response.error) {
        console.log(response.error);
        return response;
    }

    return response;
}

module.exports = {
    getEventsubs,
    subscribeTwitchEvent,
    unsubscribeTwitchEvent,
    SubscritpionsData
}