const { getUrl } = require('../util/dev')
const CHAT = require('./chat');

async function showClip(channel, clipData, streamerData, streamerChannelData) {
    if (!clipData || clipData === undefined || clipData.length === 0) return { error: 'No data', reason: 'No data was provided to the function' };
    if (!streamerData || streamerData === undefined || streamerData.length === 0) return { error: 'No data', reason: 'No data was provided to the function' };
    let streamerID = streamerChannelData.id;

    await CHAT.init(channel, null);
    await CHAT.setStreamerID(streamerID);
    let streamerColor = await CHAT.getUserColor();

    let random = Math.floor(Math.random() * clipData.length);
    let clip = clipData[random];
    let duration = clip['duration'];
    let thumbnail = clip['thumbnail_url'];

    if (!duration || !thumbnail) return null;

    let clipResponse = await fetch(`${getUrl()}/clip/${channel}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            duration,
            thumbnail,
            title: streamerData.title,
            game: streamerData.game_name,
            streamer: streamerData.broadcaster_name,
            profileImg: streamerChannelData.profile_image_url,
            description: streamerChannelData.description,
            streamerColor: streamerColor
        })
    });

    let clipResData = clipResponse;

    return clipResData;
}

module.exports = showClip;