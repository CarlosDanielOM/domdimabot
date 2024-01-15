require('dotenv').config();
const commands = require('../commands/index.js');
const func = require('../functions/index.js');
const ChatLog = require('../schemas/chat_log.schema.js');

const commandsRegex = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?$/);

const modID = '698614112';

let isMod;
let user;
let osito;

async function message(client, channel, tags, message) {
    if (tags.mod || tags.username === channel || tags.username === 'cdom201') {
        isMod = true;
    } else {
        isMod = false;
    }

    osito = false;

    let subType = null;

    if (tags.subscriber) {
        subType = tags['badge-info-raw'].split('/')[0];
        if (subType === 'founder') {
            isFounder = true;
        }
    }

    const [raw, command, argument] = message.match(commandsRegex) || [];

    if (channel === 'unositopolar' && (message === '!sumimetro')) {
        user = argument || tags['display-name'];
        let sumimetro = await commands.sumimetro(channel, tags['display-name'], user);
        osito = true;
        return client.say(channel, sumimetro.message);
    }

    if (!osito) {
        switch (command) {
            case 'ruletarusa':
                if ((tags.username !== channel) && !tags.mod) { isMod = false; }
                if (isMod) return client.say(channel, `No puedes disparar te como un mod, no seas pendejo.`);
                let dead = commands.ruletarusa();
                if (dead) {
                    let broadcasterID = await func.getUserID(channel);
                    client.say(channel, `${tags['display-name']} ha jalado el gatillo y la bala ha sido disparada causando su muerte.`);
                    let timeout = await func.timeoutUser(broadcasterID, tags['user-id'], modID, 150, 'Ruleta Rusa');

                    if (timeout.status === 401) {
                        client.say(channel, `${channel}, No tengo permisos para banear usuarios!`);
                    }

                } else {
                    client.say(channel, `${tags['display-name']} ha jalado el gatillo y la bala no ha sido disparada.`);
                }
                break;
            case 'discord':
                let discord = commands.discord(channel);
                client.say('cdom201', discord.message);
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
                let prediRes = await commands.prediction('CREATE', channel, argument);
                if (prediRes.error) return client.say(channel, `${prediRes.reason}`);
                client.say(channel, prediRes.message);
                break;
            case 'endpredi':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let endPredi = await commands.prediction('END', channel, argument);
                if (endPredi.error) return client.say(channel, `${endPredi.reason}`);
                client.say(channel, endPredi.message)
                break;
            case 'cancelpredi':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let cancelPredi = await commands.prediction('CANCELED', channel);
                if (cancelPredi.error) return client.say(channel, `${cancelPredi.reason}`);
                client.say(channel, cancelPredi.message);
                break;
            case 'lockpredi':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let lockPredi = await commands.prediction('LOCKED', channel);
                if (lockPredi.error) return client.say(channel, lockPredi.reason);
                client.say(channel, lockPredi.reason)
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
            case 's':
                let s = await func.speach(tags, argument, channel);
                if (s.error) return client.say(channel, `${s.reason}`);
                break;
            case 'sumimetro':
                user = argument || tags['display-name'];
                let sumimetro = await commands.sumimetro(channel, tags['display-name'], user);
                client.say(channel, sumimetro.message);
                break;
            case 'memide':
                user = argument || tags['display-name'];
                let memide = func.memide(user);
                client.say(channel, memide.message);
                break;
            case 'amor':
                let amor = func.amor(tags, argument);
                client.say(channel, amor.message);
                break;
            case 'ponerla':
                user = argument || tags['display-name'];
                let ponerla = func.ponerla(user);
                client.say(channel, ponerla.message);
                break;
            case 'mecabe':
                user = argument || tags['display-name'];
                let mecabe = func.mecabe(user);
                client.say(channel, mecabe.message);
                break;
            case 'resetsumimetro':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let reset = await commands.resetSumimetro(channel);
                if (reset.error) return client.say(channel, `${reset.reason}`);
                client.say(channel, reset.message);
                break;
            case 'onlyemotes':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let onlyEmotes = await commands.onlyEmotes(channel, modID);
                if (onlyEmotes.error) return client.say(channel, `${onlyEmotes.reason}`);
                client.say(channel, onlyEmotes.message);
                break;
            case 'awynowo':
                client.say(channel, `Siempre dominante, nunca sumiso.`);
                break;
            case 'cc':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let cc = await commands.cc('CREATE', channel, argument);
                if (cc.error) return client.say(channel, `${cc.reason}`);
                client.say(channel, cc.message);
                break;
            case 'dc':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let dc = await commands.cc('DELETE', channel, argument);
                if (dc.error) return client.say(channel, `${dc.reason}`);
                client.say(channel, dc.message);
                break;
            case 'ec':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let ec = await commands.cc('EDIT', channel, argument);
                if (ec.error) return client.say(channel, `${ec.reason}`);
                client.say(channel, ec.message);
                break;
            default:
                break;
        }
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