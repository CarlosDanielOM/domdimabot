const { getTwitchHelixURL } = require('../util/links');
const { getBotHeader } = require('../util/headers');

async function getGameByID(id) {
    let headers = await getBotHeader();
    let response = await fetch(`${getTwitchHelixURL()}/games?id=${id}`, {
        method: 'GET',
        headers
    });

    let data = await response.json();
    data = data.data[0];

    return data;
}

module.exports = getGameByID;