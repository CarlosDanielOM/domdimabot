const { getBotHeader } = require('../util/headers');
const { getTwitchHelixURL } = require('../util/links')

async function getUser(userID) {
    let headers = await getBotHeader();

    let response = await fetch(`${getTwitchHelixURL()}/users?id=${userID}`, {
        method: 'GET',
        headers
    });

    let data = await response.json();
    if (data.error) return { error: data.error, reason: data.message, status: data.status };
    data = data.data[0];

    return data;
}

module.exports = getUser;