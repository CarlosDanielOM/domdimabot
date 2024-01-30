const CLIENT = require('../util/client');
const functions = require('../functions');
const commands = require('../commands');
const redeemHandler = require('./redeem');

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
        case 'stream.offline':
            client.say(eventData.broadcaster_user_login, `Hey! ${eventData.broadcaster_user_name} ha terminado su stream! Esperamos verte en el proximo directo!`);
            break;
        case 'channel.channel_points_custom_reward_redemption.add':
            redeemHandler(client, eventData);
            break;
        case 'channel.ad_break.begin':
            client.say(eventData.broadcaster_user_login, `Hey! a iniciado un anuncio de ${eventData.duration_seconds} segundos!`);
            setTimeout(() => {
                client.say(eventData.broadcaster_user_login, `Hey! el anuncio ha terminado!`);
            }, eventData.duration_seconds * 1000);
            break;
        default:
            break;
    }
}

module.exports = eventsubHandler;