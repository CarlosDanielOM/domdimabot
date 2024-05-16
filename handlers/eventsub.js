const CLIENT = require('../util/client');
const functions = require('../functions');
const commands = require('../commands');
const streamers = require('../class/streamers');

const eventsubSchema = require('../schemas/eventsub');
const channelSchema = require('../schemas/channel.schema');

const redeemHandler = require('./redeem');
const raidHandler = require('./raided');

const resetRedemptionPrice = require('../redemption_functions/resetredemptioncosts');
const unVIPExpiredUser = require('../redemption_functions/unvipexpired');
const startTimerCommands = require('../timer_functions/starttimers');
const stopTimerCommands = require('../timer_functions/stoptimer');
const defaultMessages = require('../util/defaultmessage');

let client;

async function eventsubHandler(subscriptionData, eventData) {
    let streamer = await streamers.getStreamerById(eventData.broadcaster_user_id);
    if(!streamer) {
        streamer = await streamers.getStreamerById(eventData.to_broadcaster_user_id);
        if(!streamer) return;
    };
    client = await CLIENT.getClient();
    let { type, version, status, cost, id } = subscriptionData;
    let eventsubData = await eventsubSchema.findOne({ type, channelID: eventData.broadcaster_user_id});
    if(!eventsubData) {
        eventsubData = await eventsubSchema.findOne({ type, channelID: eventData.to_broadcaster_user_id });
        if(!eventsubData) { 
            eventsubData = {
                enabled: true,
            };
            eventsubData.message = '';
            console.log({ error: 'No data found', type, channelID: eventData.broadcaster_user_id });
        }
    }
    if(!eventsubData.enabled) return;

    switch (type) {
        case 'channel.follow':
            if(eventsubData.message == '' || eventsubData.message == null) {
                eventsubData.message = '$(user) has followed the channel! Welcome!';
            };
            defaultMessages(client, eventData, eventsubData.message);
            break;
        case 'stream.online':
            if(eventsubData.message == '' || eventsubData.message == null) {
                eventsubData.message = `Hey! $(twitch channel) is live! $(twitch title) playing $(twitch game)!`;
            };
            defaultMessages(client, eventData, eventsubData.message);
            //! SEPARATOR FOR FUNCTIONS
            unVIPExpiredUser(client, eventData);
            await startTimerCommands(client, eventData);
            break;
        case 'stream.offline':
            if(eventsubData.message == '' || eventsubData.message == null) {
                eventsubData.message = `Hey! $(twitch channel) has gone offline!`;
            };
            defaultMessages(client, eventData, eventsubData.message);
            //! SEPARATOR FOR FUNCTIONS
            resetRedemptionPrice(client, eventData.broadcaster_user_id);
            stopTimerCommands(client, eventData);
            break;
        case 'channel.channel_points_custom_reward_redemption.add':
            redeemHandler(client, eventData);
            break;
        case 'channel.ad_break.begin':
            if(eventsubData.message == '' || eventsubData.message == null) {
                eventsubData.message = `Hey! $(twitch channel) is having a $(ad time) seconds ad-break!`;
            };
            defaultMessages(client, eventData, eventsubData.message);
            if(!eventsubData.endEnabled) return;
            setTimeout(() => {
                if(eventsubData.endMessage == '' || eventsubData.endMessage == null) {
                    eventsubData.endMessage = `Hey! the ad-break has ended!`;
                };
                defaultMessages(client, eventData, eventsubData.endMessage);
            }, eventData.duration_seconds * 1000);
            break;
        case 'channel.raid':
            if(!eventsubData.message || eventsubData.message == '' || eventsubData.message == null) {
                eventsubData.message = `Hey! $(twitch channel) is being raided by $(raid channel) with $(raid viewers) viewers!`
            }
            await raidHandler(client, eventData, eventsubData)
            break;
        case 'channel.ban':
            if(!eventData.is_permanent) {
                if(eventsubData.temporalBanMessage == '' || eventsubData.temporalBanMessage == null) {
                    eventsubData.temporalBanMessage = `$(user) has been banned for $(ban time) seconds from the channel! by $(ban mod) for $(ban reason)`
                }
                defaultMessages(client, eventData, eventsubData.temporalBanMessage)
            } else {
                if(eventsubData.message == '' || eventsubData.message == null) {
                    eventsubData.message = `$(user) has been banned for from the channel! by $(ban mod) for $(ban reason)`
                }
                defaultMessages(client, eventData, eventsubData.message)
            }
            break;
        default:
            break;
    }
}

module.exports = eventsubHandler;