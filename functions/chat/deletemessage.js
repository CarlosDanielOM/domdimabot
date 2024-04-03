const { getStreamerHeader } = require('../../util/headers');
const { getTwitchHelixURL } = require('../../util/links');
const getUserID = require('../getuserid');

async function deleteMessage(messageID, channel, modID) {
    let helixURL = getTwitchHelixURL();
    let channelID = await getUserID(channel) || null;

    if (!channelID) return { error: true, message: 'Invalid channel name' };

    let streamerHeaders = await getStreamerHeader(channel);

    let response = await fetch(`${helixURL}/moderation/chat?broadcaster_id=${channelID}&moderator_id=${modID}&message_id=${messageID}`, {
        method: 'DELETE',
        headers: streamerHeaders
    })

    if (response.status === 204) return { error: false, status: 204 };

    let json = await response.json();

    if (json.error) return json;

}

module.exports = deleteMessage;