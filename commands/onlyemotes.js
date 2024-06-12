const CHAT = require('../functions/chat');
const dragonFlyDB = require('../util/database/dragonflydb');
const STREAMERS = require('../class/streamers');
const commandSchema = require('../schemas/command');

async function OnlyEmotes(channel, argument, userLevel = 1) {
    let streamer = await STREAMERS.getStreamer(channel);
    let commandInfo = await commandSchema.findOne({channelID: streamer.user_id, name: 'Only Emotes'});
    if (!commandInfo) {
        return {
            error: true,
            message: 'Error while finding command.'
        }
    }

    if (userLevel < commandInfo.userLevel) {
        return {
            error: true,
            message: 'You do not have enough privilage to use this command.'
        }
    }
    
    let cache = await dragonFlyDB.getClient();
    let res = null;

    let seconds = 0;

    if(argument) {
        seconds = parseInt(argument);

        if (isNaN(seconds)) {
            return {
                error: true,
                message: 'El argumento debe ser un número.'
            }
        }
    }
    
    let value = 1;
    let active = false;
    let status = await cache.get(`${channel}:chat:onlyemotes`);

    if(!status) {
        active = await CHAT.getOnlyEmotes(streamer.user_id);

        if(active.status) {
            value = 1;
        } else {
            value = 0;
        }
        await cache.set(`${channel}:chat:onlyemotes`, value, {EX: 60 * 60});
        status = value;
    }

    if(status == 1) {
        value = 0;
        active = false;
    } else {
        value = 1;
        active = true;
    }
    
    res = await CHAT.setOnlyEmotes(streamer.user_id, active, streamer.user_id);

    if (res.error) {
        return res;
    }

    await cache.set(`${channel}:chat:onlyemotes`, value, {EX: 60 * 60});

    if(seconds > 0) {
        setTimeout(async () => {
            await CHAT.setOnlyEmotes(streamer.user_id, false, streamer.user_id);
            await cache.set(`${channel}:chat:onlyemotes`, 0, {EX: 60 * 60});
        }, seconds * 1000);
    }

    res = {
        error: false,
        message: `Modo solo emotes ${active ? 'activado' : 'desactivado'} ${seconds > 0 ? 'por ' + seconds + ' segundos' : ''}.`
    }

    return res;

}

module.exports = OnlyEmotes;