const { getTwitchHelixURL } = require("../util/links")
const { getBotHeader } = require("../util/headers")

async function getChannel(streamerID) {
    let headers = await getBotHeader();
    let response = await fetch(`${getTwitchHelixURL()}/channels?broadcaster_id=${streamerID}`, {
        method: 'GET',
        headers
    });

    let channel = await response.json();

    return channel.data[0];

}

module.exports = getChannel;