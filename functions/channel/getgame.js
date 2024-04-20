const { getStreamerHeader, getStreamerHeaderById } = require("../../util/headers");
const { getTwitchHelixURL } = require("../../util/links");
const getUserID = require("../getuserid");


async function getCurrentGame(channelID = null) {
    let helixURL = getTwitchHelixURL();

    if (!channelID) return { error: true, reason: 'Invalid channel name' };

    let streamerHeaders = await getStreamerHeaderById(channelID);

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