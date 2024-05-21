let {getTwitchHelixURL} = require('../../util/links')

async function getUserColor(userID) {
    let response = await fetch(`${getTwitchHelixURL()}/chat/color?user_id=${userID}`, {
        method: 'GET',
        headers: this.botHeaders
    });

    let data = await response.json();
    if (data.error) return { error: data.error, reason: data.message, status: data.status }
    data = data.data[0];

    return data.color;
}

module.exports = getUserColor;