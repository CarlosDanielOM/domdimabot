const STREAMERS = require('../class/streamers')
const functions = require('../functions');
const CHANNEL = require('../functions/channel')

let specialCommandsFunc = (/\$\(([a-z]+)\s?([a-z0-9]+)?\s?([a-zA-Z0-9\s]+)?\)/g);

async function textConvertor(channelID, eventData, message, rewardData = {}) {
    let streamer = await STREAMERS.getStreamerById(channelID);
    let specials = message.match(specialCommandsFunc) || [];
    for (let i = 0; i < specials.length; i++) {
        specialCommandsFunc.lastIndex = 0;
        let special = specialCommandsFunc.exec(message);
        switch (special[1]) {
            case 'user':
                message = message.replace(special[0], eventData.user_name);
                break;
            case 'random':
                let maxNumber = special[2] || 100;
                let random = Math.floor(Math.random() * maxNumber) + 1;
                message = message.replace(special[0], random);
                break;
            case 'twitch':
                if (!special[2]) break;
                switch (special[2]) {
                    case 'subs':
                        let totalSubs = await CHANNEL.getTotalSubs(streamer.name);
                        message = message.replace(special[0], totalSubs.total);
                        break;
                    case 'title':
                        let title = await CHANNEL.getTitle(streamer.name);
                        message = message.replace(special[0], title);
                        break;
                    case 'channel':
                        message = message.replace(special[0], streamer.name);
                        break;
                    case 'game':
                        let game = await CHANNEL.getGame(streamer.user_id);
                        message = message.replace(special[0], game);
                        break;
                    default:
                        break;
                }
                break
            case 'set':
                if (!special[2]) break;
                switch (special[2]) {
                    case 'game':
                        let game = special[3] || eventData.user_input;
                        let updated = await CHANNEL.setGame(game, streamer.user_id);
                        if (updated.error) message = message.replace(special[0], updated.reason);
                        else message = message.replace(special[0], game);
                        break;
                    case 'title':
                        let title = special[3] || argument;
                        let updatedTitle = await CHANNEL.setTitle(streamer.name, title);
                        if (updatedTitle.error) message = message.replace(special[0], updatedTitle.reason);
                        else message = message.replace(special[0], title);
                        break;
                    default:
                        break;
                }
                break;
            case 'reward':
                if (!rewardData) break;
                if (!special[2]) break;
                switch (special[2]) {
                    case 'cost':
                        let cost = rewardData.cost;
                        message = message.replace(special[0], cost);
                        break;
                    case 'title':
                        let title = rewardData.title;
                        message = message.replace(special[0], title);
                        break;
                    case 'prompt':
                        let prompt = rewardData.prompt;
                        message = message.replace(special[0], prompt);
                        break;
                    case 'message':
                        let rewardMessage = eventData.user_input;
                        message = message.replace(special[0], rewardMessage);
                        break;
                    default:
                        break;
                }
                break;
            case 'ad':
                if (!special[2]) break;
                switch (special[2]) {
                    case 'time':
                        let time = eventData.duration_seconds;
                        message = message.replace(special[0], time);
                        break;
                    default:
                        break;
                }
                break;
            case 'raid':
                if (!special[2]) break;
                let raiderChannelData = await functions.getChannel(eventData.from_broadcaster_user_id);
                switch (special[2]) {
                    case 'channel':
                        let raidChannel = eventData.from_broadcaster_user_name;
                        message = message.replace(special[0], raidChannel);
                        break;
                    case 'viewers':
                        let viewers = eventData.viewers;
                        message = message.replace(special[0], viewers);
                        break;
                    case 'game': 
                        let game = raiderChannelData.game_name;
                        message = message.replace(special[0], game);
                        break;
                    case 'title':
                        let title = raiderChannelData.title;
                        message = message.replace(special[0], title);
                        break;
                    case 'language':
                        let language = raiderChannelData.broadcaster_language;
                        message = message.replace(special[0], language);
                        break;
                }
                break;
            case 'ban':
                if (!special[2]) break;
                switch (special[2]) {
                    case 'time':
                        if(eventData.is_permanent) break;
                        let start = eventData.banned_at;
                        let end = eventData.ends_at;
                        let startDate = new Date(start);
                        let endDate = new Date(end);
                        let time = Math.floor((endDate - startDate) / 1000);
                        message = message.replace(special[0], time);
                        break;
                    case 'reason':
                        let reason = eventData.reason;
                        message = message.replace(special[0], reason);
                        break;
                    case 'mod':
                        let mod = eventData.moderator_user_name;
                        message = message.replace(special[0], mod);
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }
    return { message };
}

module.exports = textConvertor;