const streamers = require('../../class/streamers');
const { getStreamerHeader } = require('../../util/headers');
const { getTwitchHelixURL } = require('../../util/links');

async function deleteModerator(channel, userID) {
    const streamer = streamers.getStreamer(channel);
    const headers = await getStreamerHeader(channel);

    let response = await fetch(`${getTwitchHelixURL()}/moderation/moderators?broadcaster_id=${streamer.user_id}&user_id=${userID}`, {
        method: 'DELETE',
        headers: headers
    })

    if (response.status === 204) return { error: false, status: 204 };

    let json = await response.json();

    if (json.error) return json;

}

module.exports = deleteModerator;