const { getTwitchHelixURL } = require('../../util/links')
const { getStreamerHeader } = require('../../util/headers')

async function setVip(channelID, headers, userID) {
    const helixURL = getTwitchHelixURL();

    console.log({ channelID, headers, userID, helix: `${helixURL}/channels/vips?broadcaster_id=${channelID}&user_id=${userID}`, where: 'setVip' })

    let setVIP = await fetch(`${helixURL}/channels/vips?broadcaster_id=${channelID}&user_id=${userID}`, { method: 'POST', headers: headers });

    if (setVIP.status == 204) return { error: false, status: 204 }

    let json = await setVIP.json();

    if (json.error) return json;

    return json;

}

module.exports = setVip;