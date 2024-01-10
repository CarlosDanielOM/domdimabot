const { getTwitchHelixURL } = require('../util/links');
const { getBotHeader } = require('../util/headers');

async function makeShoutout(channelID, StreamerID, modID) {
    headers = await getBotHeader();
    let response = await fetch(`${getTwitchHelixURL()}/chat/shoutouts?from_broadcaster_id=${channelID}&to_broadcaster_id=${StreamerID}&moderator_id=${modID}`, {
        method: 'POST',
        headers
    })

    return response;
}

module.exports = makeShoutout;