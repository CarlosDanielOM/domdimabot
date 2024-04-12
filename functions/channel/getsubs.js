const { getTwitchHelixURL } = require('../../util/links')
const STREAMERS = require('../../class/streamers');
const { getStreamerHeader } = require('../../util/headers');

async function getTotalSubs(streamer) {
    let channel = await STREAMERS.getStreamer(streamer);
    let headers = await getStreamerHeader(streamer);
    const response = await fetch(`${getTwitchHelixURL()}/subscriptions?broadcaster_id=${channel.user_id}`, {
        method: 'GET',
        headers: headers
    });

    const data = await response.json();

    if (data.error) {
        console.log({ error: true, reason: data.reason, for: streamer, where: 'getsubs.js' });
        return { error: true, reason: data.reason };
    }

    return { error: false, total: data.total };

}

module.exports = getTotalSubs;