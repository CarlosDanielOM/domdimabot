const { getTwitchHelixURL } = require('../../util/links')

async function removeVIP(channelID, headers, userID) {
    const helixURL = getTwitchHelixURL();

    let removeVIP = await fetch(`${helixURL}channels/vip?broadcaster_id=${channelID}&user_id=${userID}`, { method: 'DELETE', headers: headers });

    if (removeVIP.status === 204) return { error: false, status: 204 };

    let json = await removeVIP.json();

    if (json.error) return json;

    return json;

}

module.exports = removeVIP;