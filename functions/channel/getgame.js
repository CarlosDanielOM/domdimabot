const { getStreamerHeader } = require("../../util/headers");
const { getTwitchHelixURL } = require("../../util/links");
const getUserID = require("../getuserid");


async function getCurrentGame(channel) {
    let helixURL = getTwitchHelixURL();
    let channelID = await getUserID(channel) || null;

    if (!channelID) return { error: true, message: 'Invalid channel name' };

    let streamerHeaders = await getStreamerHeader(channel);

    let response = await fetch(`${helixURL}/channels?broadcaster_id=${channelID}`, {
        method: 'GET',
        headers: streamerHeaders
    });

    let data = await response.json();

    if (data.error) return { error: data.error, reason: data.message, status: data.status };

    data = data.data[0];

    let game = data.game_name;

    return game;
}

module.exports = getCurrentGame;