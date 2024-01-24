const CLIENT = require('../util/client');
const functions = require('../functions');
const commands = require('../commands');

let client;

async function eventsubHandler(subscriptionData, eventData) {
    client = await CLIENT.getClient();
    let { type, version, status, cost } = subscriptionData;

    switch (type) {
        case 'channel.follow':
            client.say(eventData.broadcaster_user_login, `${eventData.user_name} muchas gracias por el follow! Espero te la pases bien.`);
            break;
        case 'stream.online':
            let channelData = await functions.getChannel(eventData.broadcaster_user_id);
            client.say(eventData.broadcaster_user_login, `Hey! ${eventData.broadcaster_user_name} está en vivo! ${channelData.title} jugando ${channelData.game_name}!`);
            break;
        default:
            break;
    }
}

module.exports = eventsubHandler;