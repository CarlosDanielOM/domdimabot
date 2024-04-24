const CLIENT = require('../util/client');
const functions = require('../functions');
const commands = require('../commands');
const redeemHandler = require('./redeem');
const resetRedemptionPrice = require('../redemption_functions/resetredemptioncosts');
const unVIPExpiredUser = require('../redemption_functions/unvipexpired');
const startTimerCommands = require('../timer_functions/starttimers');
const stopTimerCommands = require('../timer_functions/stoptimer');

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
            unVIPExpiredUser(client, eventData);
            await startTimerCommands(client, eventData);
            break;
        case 'stream.offline':
            client.say(eventData.broadcaster_user_login, `Hey! ${eventData.broadcaster_user_name} ha terminado su stream! Esperamos verte en el proximo directo!`);
            resetRedemptionPrice(client, eventData.broadcaster_user_id);
            stopTimerCommands(client, eventData);
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