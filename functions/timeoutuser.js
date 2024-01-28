const { getBotHeader } = require("../util/headers");

async function timeoutUser(broadcaster_id, userID, modID, duration, reason = null) {
    let headers = await getBotHeader();
    let response = await fetch(`https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${broadcaster_id}&moderator_id=${modID}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            data: {
                user_id: userID,
                duration,
                reason
            }
        })
    });

    return await response.json();
}

module.exports = timeoutUser;