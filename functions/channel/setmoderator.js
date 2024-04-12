const streamers = require('../../class/streamers');
const { getStreamerHeader } = require('../../util/headers');
const { getTwitchHelixURL } = require('../../util/links');

async function setModerator(channel, user = 698614112) {
    const streamer = await streamers.getStreamer(channel);
    const headers = await getStreamerHeader(channel);
    let response = await fetch(`${getTwitchHelixURL()}/moderation/moderators?broadcaster_id=${streamer.user_id}&user_id=${user}`, {
        method: 'POST',
        headers: headers
    });

    if (response.status === 204) return { error: false, message: 'Moderator added.', status: 204 };

    let json = await response.json();

    if (json.error) {
        return { error: true, reason: json.message, status: json.status };
    }

    return { error: false, message: '', status: response.status };

}

module.exports = setModerator;