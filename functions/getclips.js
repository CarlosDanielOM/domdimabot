const { getTwitchHelixURL } = require("../util/links");
const { getBotHeader } = require("../util/headers");

async function getclips(user) {
    let headers = await getBotHeader();
    let response = await fetch(`${getTwitchHelixURL()}/clips?broadcaster_id=${user}`, {
        method: 'GET',
        headers
    });

    let data = await response.json();
    let clips = data.data;

    return clips;
}

module.exports = getclips;