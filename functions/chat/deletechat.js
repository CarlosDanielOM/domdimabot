const { getStreamerHeader } = require("../../util/headers");
const { getTwitchHelixURL } = require("../../util/links");
const getUserID = require("../getuserid");

async function clearChat(channel, modID) {
    let helixURL = getTwitchHelixURL();
    let channelID = await getUserID(channel) || null;

    if (!channelID) return { error: true, message: 'Invalid channel name' };

    let streamHeaders = await getStreamerHeader(channel);

    let response = await fetch(`${helixURL}/moderation/chat?broadcaster_id=${channelID}&moderator_id=${modID}`, {
        method: 'DELETE',
        headers: streamHeaders
    })

    if (response.status === 204) return { error: false, status: 204 };

    let json = await response.json();

    if (json.error) return json;

}

module.exports = clearChat;