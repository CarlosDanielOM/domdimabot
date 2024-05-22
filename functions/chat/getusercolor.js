let {getTwitchHelixURL} = require('../../util/links');
const {getBotHeader} = require('../../util/headers')

async function getUserColor(userID) {
    let response = await fetch(`${getTwitchHelixURL()}/chat/color?user_id=${userID}`, {
        method: 'GET',
        headers: await getBotHeader()
    });

    let data = await response.json();
    if (data.error) return { error: data.error, reason: data.message, status: data.status }
    data = data.data[0];

    return data.color;
}

module.exports = getUserColor;