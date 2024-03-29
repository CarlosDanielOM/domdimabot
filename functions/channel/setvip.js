const { getTwitchHelixURL } = require('../../util/links')
const { getStreamerHeader } = require('../../util/headers')

async function setVip(channelID, headers, userID) {
    const helixURL = getTwitchHelixURL();

    let setVIP = await fetch(`${helixURL}channels/vips?broadcaster_id=${channelID}&user_id=${userID}`, { method: 'POST', headers: headers });

    if (setVIP.status == 204) return { error: false, status: 204 }

    let json = await setVIP.json();

    if (json.error) return json;

    return json;

}

module.exports = setVip;