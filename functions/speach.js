const { getUrl } = require('../util/dev');

async function speach(msgID, message, channel) {
    let response = await fetch(`${getUrl()}/speach/${channel}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ speach: message, msgID: msgID })
    });

    let data = await response.json();

    return { data, message };
}

module.exports = speach;