const STREAMERS = require('../../class/streamers');
const { getStreamerHeader } = require('../../util/headers');
const { getTwitchHelixURL } = require('../../util/links');

async function getTitle(channel) {
    let streamer = await STREAMERS.getStreamer(channel);
    let headers = await getStreamerHeader(channel);
    let response = await fetch(`${getTwitchHelixURL()}/channels?broadcaster_id=${streamer.user_id}`, {
        method: 'GET',
        headers: headers
    });

    let data = await response.json();

    if (data.error) return { error: data.error, reason: data.message, status: data.status };

    data = data.data[0];

    let title = data.title;

    return title;
}

module.exports = getTitle;