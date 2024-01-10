const { getBotHeader } = require('../util/headers');
const { getTwitchHelixURL } = require('../util/links');

async function getUserID(name) {
    const headers = await getBotHeader();

    let response = await fetch(`${getTwitchHelixURL()}/users?login=${name}`, {
        method: 'GET',
        headers
    });

    let data = await response.json();
    let user = data.data;

    if (!user || user === undefined || user === null || user.length === 0) {
        return null;
    }

    return user[0].id;
}

module.exports = getUserID;