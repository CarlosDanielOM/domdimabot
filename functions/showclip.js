const { getUrl } = require('../util/dev')
const CHAT = require('./chat');
const getGameByID = require('./getgamebyid');

async function showClip(channel, clipData, streamerData, streamerChannelData) {
    if (!clipData || clipData === undefined || clipData.length === 0) return { error: 'No data', reason: 'No Clip data was provided to the function' };
    if (!streamerData || streamerData === undefined || streamerData.length === 0) return { error: 'No data', reason: 'No Streamer data was provided to the function' };
    let streamerID = streamerChannelData.id;

    let streamerColor = await CHAT.getUserColor(streamerID);

    let random = Math.floor(Math.random() * clipData.length);
    let clip = clipData[random];
    let duration = clip['duration'];
    let thumbnail = clip['thumbnail_url'];

    if (!duration || !thumbnail) return null;

    let game = await getGameByID(clip.game_id);

    if(!game) {
        console.log({ error: 'Error getting game', reason: 'No game data was provided', where: 'showClip', channel: channel });
        return null;
    }

    let clipResponse = await fetch(`${getUrl()}/clip/${channel}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            duration,
            thumbnail,
            title: streamerData.title,
            game: game.name,
            streamer: streamerData.broadcaster_name,
            profileImg: streamerChannelData.profile_image_url,
            description: streamerChannelData.description,
            streamerColor: streamerColor,
        })
    });

    let clipResData = clipResponse;

    if (clipResData.error) { console.log({ error: 'Error sending clip to server', reason: clipResData, where: 'showClip', channel: channel }); };

    return clipResData;
}

module.exports = showClip;