const { shoutout } = require('../commands/index');

const modID = '698614112';

async function raid(client, channel, username, viewers, tags) {
    if (viewers < 2) return;
    let { soClip } = await shoutout(channel, username, modID);
    if (!soClip) {
        return client.say(channel, `No se ha podido reproducir el clip!`);
    }

    client.say(channel, `Gracias por la raid de ${viewers} person${viewers > 1 ? 'a' : 'itas'} ${username}!`);
}

module.exports = raid;