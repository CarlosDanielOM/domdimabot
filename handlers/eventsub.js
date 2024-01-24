const CLIENT = require('../util/client');

let client;

async function eventsubHandler(subscriptionData, eventData) {
    client = await CLIENT.getClient();
    let { type, version, status, cost } = subscriptionData;

    switch (type) {
        case 'channel.follow':
            client.say(eventData.broadcaster_user_login, `${eventData.user_name} muchas gracias por el follow! Espero te la pases bien.`);
            break;
        default:
            break;
    }
}

module.exports = eventsubHandler;