require('dotenv').config();
const commands = require('../commands/index.js');
const func = require('../functions/index.js');
const ChatLog = require('../schemas/chat_log.schema.js');

const commandsRegex = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?$/);

const modID = '698614112';

let isMod;

async function message(client, channel, tags, message) {
    if (tags.mod || tags.username === channel) {
        isMod = true;
    } else {
        isMod = false;
    }

    const [raw, command, argument] = message.match(commandsRegex) || [];

    switch (command) {
        case 'ruletarusa':
            if ((tags.username !== channel) && !tags.mod) { isMod = false; }
            if (isMod) return client.say(channel, `No puedes disparar te como un mod, no seas pendejo.`);
            let dead = commands.ruletarusa();
            if (dead) {
                client.say(channel, `${tags['display-name']} ha jalado el gatillo y la bala ha sido disparada causando su muerte.`);
                let timeout = await func.timeoutUser(broadcasterID, tags['user-id'], modID, 600, 'Ruleta Rusa');

                if (timeout.status === 401) {
                    client.say(channel, `${channel}, No tengo permisos para banear usuarios!`);
                }

            } else {
                client.say(channel, `${tags['display-name']} ha jalado el gatillo y la bala no ha sido disparada.`);
            }
            break;
        case 'discord':
            commands.discord(client, channel);
            break;
        case 'anuncio':
            if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
            if (!argument) return client.say(channel, `Debes de escribir un mensaje.`);

            let data = argument.split(';');
            let msg = data[0];
            let color = data[1];

            let broadcasterID = await func.getUserID(channel);

            let res = await func.makeAnnouncement(broadcasterID, modID, msg, color);

            if (res.status === 401) {
                client.say(channel, `${channel}, No tengo permisos para hacer anuncios!`);
            }

            break;
        case 'promo':
            if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
            let { clip, channelData } = await commands.promo(channel, argument);
            if (!clip) return client.say(channel, `No se ha podido reproducir el clip.`);
            let message = `Vayan a apoyar a ${channelData.name} en https://twitch.tv/${channelData.login} ! Estaba jugando a ${channelData.game}`;
            client.say(channel, message)
            break;
        case 'so':
            if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
            const { soClip, cooldown } = await commands.shoutout(channel, argument, modID);
            if (!soClip) return client.say(channel, `No se ha podido reproducir el clip.`);
            break;
        case 'predi':
            if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
            let prediRes = commands.prediction('CREATE', channel, argument);
            if (!prediRes) return client.say(channel, `No se ha podido crear la predicción.`);
            break;
        case 'endpredi':
            if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
            commands.prediction('END', channel, argument);
            break;
        case 'cancelpredi':
            if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
            commands.prediction('CANCELED', channel);
            break;
        case 'lockpredi':
            if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
            commands.prediction('LOCKED', channel);
            break;
        case 'poll':
            let poll = await commands.poll('CREATE', channel, argument, isMod);
            if (poll.error) return client.say(channel, `${poll.reason}`);
            client.say(channel, poll.message);
            break;
        case 'cancelpoll':
            let cancelPoll = await commands.poll('ARCHIVED', channel, argument, isMod);
            if (cancelPoll.error) return client.say(channel, `${cancelPoll.message}`);
            client.say(channel, cancelPoll.message);
            break;
        case 'endpoll':
            let endPoll = await commands.poll('TERMINATED', channel, argument, isMod);
            if (endPoll.error) return client.say(channel, `${endPoll.reason}`);
            client.say(channel, endPoll.message);
            break;
        case 'game':
            let game = await commands.game(channel, argument, isMod);
            if (game.error) return client.say(channel, `${game.reason}`);
            client.say(channel, `${tags['display-name']} --> ${game.message}`);
            break;
        case 'title':
            let title = await commands.title(channel, argument, isMod);
            if (title.error) return client.say(channel, `${title.reason}`);
            client.say(channel, `${tags['display-name']} --> ${title.message}`);
            break;
        default:
            break;
    }

    let chatBody = {
        channel: channel,
        message: message,
        username: tags['display-name'],
        timestamp: new Date()
    }

    let chatLog = await ChatLog.create(chatBody);

    if (!chatLog) {
        console.log('Error al guardar el mensaje en la base de datos.');
    }

}

module.exports = message;