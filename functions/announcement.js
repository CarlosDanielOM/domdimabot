const { getTwitchHelixURL } = require('../util/links');
const { getBotHeader } = require('../util/headers');

async function makeAnnouncement(streamer, modID, message, color = 'purple') {
    let headers = await getBotHeader();

    console.log(headers)

    let response = await fetch(`${getTwitchHelixURL()}/chat/announcements?broadcaster_id=${streamer}&moderator_id=${modID}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            message,
            color
        })
    });

    return response;
}

module.exports = makeAnnouncement;