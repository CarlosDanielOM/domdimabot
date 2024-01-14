const CHAT = require('../functions/chat');

let active = new Map();

async function OnlyEmotes(channel) {
    await CHAT.init(channel);
    let res = null;

    if (!active.has(channel)) {
        let status = await CHAT.getOnlyEmotes();

        if (status.error) {
            return status;
        }
        active.set(channel, status.status);

    }

    let status = active.get(channel);

    res = CHAT.setOnlyEmotes(!status);

    if (res.error) {
        return res;
    }

    active.set(channel, !status);

    res = {
        error: false,
        message: `Modo solo emotes ${!status ? 'activado' : 'desactivado'}.`
    }

    return res;

}

module.exports = OnlyEmotes;