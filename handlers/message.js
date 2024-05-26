require('dotenv').config();
const commands = require('../commands/index.js');
const func = require('../functions/index.js');
const CHAT = require('../functions/chat/index.js');
const CHANNEL = require('../functions/channel/index.js');
const ChatLog = require('../schemas/chat_log.schema.js');
const commandSchema = require('../schemas/command.js');
const STREAMER = require('../class/streamers.js');

const COOLDOWNS = require('../class/cooldown.js');

const commandsRegex = new RegExp(/^!([\p{L}\p{N}]+)(?:\W@?)?(.*)?$/u);
const linkRegex = new RegExp(/((http|https):\/\/)?(www\.)?[a-zA-Z-]+(\.[a-zA-Z-]{2})+(:\d+)?(\/\S*)?(\?\S+)?/gi);

const commandHandler = require('./command.js');

const modID = 698614112;

let isMod;
let user;

let channelInstances = new Map();

async function message(client, channel, tags, message) {
    let streamer = await STREAMER.getStreamer(channel);
    let commandCD = 10;
    let userlevel = giveUserLevel(channel, tags);
    let chatBody = {
        channel: channel,
        message: message,
        username: tags['display-name'],
    }

    let chatLog = await ChatLog.create(chatBody);

    if (!chatLog) {
        console.log('Error al guardar el mensaje en la base de datos.');
    }

    let hasLink = message.match(linkRegex);
    if (hasLink && !tags.mod && !tags.username === channel && !tags.username === 'cdom201' && !tags.username === 'domdimabot') {
        if (channel == 'ariascarletvt' || channel == 'cdom201') {
            let q = await CHAT.deleteMessage(tags.id, channel, modID);
        }
    }

    let onCooldown = false;

    if (!channelInstances.has(channel)) {
        channelInstances.set(channel, new COOLDOWNS());
    }
    let channelInstance = channelInstances.get(channel);

    if (tags.mod || tags.username === channel || tags.username === 'cdom201') {
        isMod = true;
    } else {
        isMod = false;
    }

    const [raw, command, argument] = message.match(commandsRegex) || [];

    if (!command) return;

    let commandData = await commandSchema.findOne({ channelID: streamer.user_id, cmd: command, enabled: true }, 'name type cooldown userLevel func');

    if (!commandData) return;
    if (commandData.enabled === false) return;

    if (channelInstance.hasCooldown(command)) {
        onCooldown = true;
    }

    if (!onCooldown) {
        switch (commandData.func) {
            case 'ruletarusa':
                if ((tags.username !== channel) && !tags.mod) { isMod = false; }
                let ruletarusa = await commands.ruletarusa(channel, tags['display-name'], modID, isMod);
                if (ruletarusa.error) return client.say(channel, `${ruletarusa.reason}`);
                client.say(channel, ruletarusa.message);
                commandCD = ruletarusa.cooldown;
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
                let promo = await commands.promo(channel, argument);
                if (!promo.clip) return client.say(channel, `No se ha podido reproducir el clip.`);
                let message = `Vayan a apoyar a ${promo.channelData.name} en https://twitch.tv/${promo.channelData.login} ! Estaba jugando a ${promo.channelData.game}`;
                client.say(channel, message)
                commandCD = promo.cooldown;
                break;
            case 'shoutout':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                const shoutoutRes = await commands.shoutout(channel, argument, modID);
                if (!shoutoutRes.soClip) return client.say(channel, `No se ha podido reproducir el clip.`);
                break;
            case 'predi':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let prediRes = await commands.prediction('CREATE', channel, argument);
                if (prediRes.error) return client.say(channel, `${prediRes.reason}`);
                client.say(channel, prediRes.message);
                commandCD = prediRes.cooldown;
                break;
            case 'endpredi':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let endPredi = await commands.prediction('END', channel, argument);
                if (endPredi.error) return client.say(channel, `${endPredi.reason}`);
                client.say(channel, endPredi.message)
                commandCD = endPredi.cooldown;
                break;
            case 'cancelpredi':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let cancelPredi = await commands.prediction('CANCELED', channel);
                if (cancelPredi.error) return client.say(channel, `${cancelPredi.reason}`);
                client.say(channel, cancelPredi.message);
                commandCD = cancelPredi.cooldown;
                break;
            case 'lockpredi':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let lockPredi = await commands.prediction('LOCKED', channel);
                if (lockPredi.error) return client.say(channel, lockPredi.reason);
                client.say(channel, lockPredi.reason)
                commandCD = lockPredi.cooldown;
                break;
            case 'poll':
                let poll = await commands.poll('CREATE', channel, argument, isMod);
                if (poll.error) return client.say(channel, `${poll.reason}`);
                client.say(channel, poll.message);
                commandCD = poll.cooldown;
                break;
            case 'cancelpoll':
                let cancelPoll = await commands.poll('ARCHIVED', channel, argument, isMod);
                if (cancelPoll.error) return client.say(channel, `${cancelPoll.message}`);
                client.say(channel, cancelPoll.message);
                commandCD = cancelPoll.cooldown;
                break;
            case 'endpoll':
                let endPoll = await commands.poll('TERMINATED', channel, argument, isMod);
                if (endPoll.error) return client.say(channel, `${endPoll.reason}`);
                client.say(channel, endPoll.message);
                commandCD = endPoll.cooldown;
                break;
            case 'game':
                let game = await commands.game(channel, argument, userlevel);
                if (game.error) return client.say(channel, `${game.reason}`);
                client.say(channel, `${tags['display-name']} --> ${game.message}`);
                commandCD = game.cooldown;
                break;
            case 'title':
                let title = await commands.title(channel, argument, isMod);
                if (title.error) return client.say(channel, `${title.reason}`);
                client.say(channel, `${tags['display-name']} --> ${title.message}`);
                commandCD = title.cooldown;
                break;
            case 'speach':
                let s = await commands.speachChat(tags, argument, channel);
                if (s.error) return client.say(channel, `${s.reason}`);
                commandCD = s.cooldown;
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
            case 'onlyemotes':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let onlyEmotes = await commands.onlyEmotes(channel, modID);
                if (onlyEmotes.error) return client.say(channel, `${onlyEmotes.reason}`);
                client.say(channel, onlyEmotes.message);
                break;
            case 'awynowo':
                client.say(channel, `Siempre dominante, nunca sumiso.`);
                commandCD = 10;
                break;
            case 'createCommand':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let cc = await commands.cmd('CREATE', channel, argument, 'command');
                if (cc.error) return client.say(channel, `${cc.reason}`);
                client.say(channel, cc.message);
                break;
            case 'deleteCommand':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let dc = await commands.cmd('DELETE', channel, argument);
                if (dc.error) return client.say(channel, `${dc.reason}`);
                client.say(channel, dc.message);
                break;
            case 'editCommand':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let ec = await commands.cmd('EDIT', channel, argument);
                if (ec.error) return client.say(channel, `${ec.reason}`);
                client.say(channel, ec.message);
                break;
            case 'followage':
                let followageUser = argument || tags['display-name'];
                let followage = await commands.followage(channel, followageUser);
                if (followage.error) return client.say(channel, `${followage.reason}`);
                client.say(channel, followage.message);
                break;
            case 'ip':
                if (channel !== 'nerfoscar') return;
                if ((tags.username !== channel) && !tags.mod) { isMod = false; }
                if (isMod) return client.say(channel, `Ya quisieras papi`);
                let ip = await commands.ip(channel, tags['display-name'], modID);
                if (ip.error) return client.say(channel, `${ip.reason}`);
                client.say(channel, ip.message);
                break;
            case 'createClip':
                client.say(channel, `Guardando clip...`);
                let saveClip = await commands.createClip(channel);
                if (saveClip.error) return client.say(channel, `${saveClip.reason}`);
                client.say(channel, saveClip.message);
                break;
            case 'testy':
                console.log(await CHANNEL.setModerator(channel, 533538623));
                break;
            case 'commands':
                let commandList = await commands.commandList(channel, userlevel);
                if (commandList.error) return client.say(channel, `${commandList.reason}`);
                client.say(channel, commandList.message);
                commandCD = commandList.cooldown
                break;
            case 'chiste':
                return;
                let chiste = await commands.chiste(argument);
                if (chiste.error) return client.say(channel, `${chiste.reason}`);
                client.say(channel, chiste.message);
                commandCD = chiste.cooldown;
                break;
            case 'clearChat':
                let clearChatRes = CHAT.clearChat(channel, modID, userlevel);
                if (clearChatRes.error) return client.say(channel, `${clearChatRes.reason}`);
                client.say(channel, `Chat limpiado por ${tags['display-name']}`);
                break;
            case 'enableCommand':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let enableCommand = await commands.enableCommand(channel, argument);
                if (enableCommand.error) return client.say(channel, `${enableCommand.reason}`);
                client.say(channel, enableCommand.message);
                break;
            case 'disableCommand':
                if (!isMod) return client.say(channel, `No tienes permisos para usar este comando.`);
                let disableCommand = await commands.disableCommand(channel, argument);
                if (disableCommand.error) return client.say(channel, `${disableCommand.reason}`);
                client.say(channel, disableCommand.message);
                break;
            case 'duelo':
                let duelo = await commands.duelo(client, channel, tags['display-name'], argument);
                if (duelo.error) return client.say(channel, `${duelo.reason}`);
                client.say(channel, duelo.message);
                break;
            case 'furrometro':
                let newArgument = argument || tags['display-name'];
                let furrometro = await commands.furrometro(channel, tags['display-name'], newArgument, userlevel);
                if (furrometro.error) return client.say(channel, `${furrometro.reason}`);
                client.say(channel, furrometro.message);
                break;
            case 'mod':
                let mod = await commands.addModerator(channel, argument, userlevel);
                if (mod.error) return client.say(channel, `${mod.reason}`);
                client.say(channel, mod.message);
                break;
            case 'vip':
                let addVIP = await commands.addVIP(channel, argument, tags, userlevel);
                if (addVIP.error) return client.say(channel, `${addVIP.message}`);
                client.say(channel, addVIP.message);
                break;
            case 'unvip':
                let unVIP = await commands.unVIP(channel, argument, tags, userlevel);
                if (unVIP.error) return client.say(channel, `${unVIP.message}`);
                client.say(channel, unVIP.message);
                break;
            case 'createCommandTimer':
                let cct = await commands.createTimerCommand(channel, argument, userlevel);
                if (cct.error) return client.say(channel, `${cct.message}`);
                client.say(channel, cct.message);
                break;
            case 'editCommandTimer':
                let ect = await commands.editTimerCommand(channel, argument, userlevel);
                if (ect.error) return client.say(channel, `${ect.message}`);
                client.say(channel, ect.message);
                break;
            case 'deleteCommandTimer':
                let dct = await commands.deleteTimerCommand(channel, argument, userlevel);
                if (dct.error) return client.say(channel, `${dct.message}`);
                client.say(channel, dct.message);
                break;
            case 'spotifySongRequest': 
                let ssr = await commands.spotifySongRequest(channel, argument, userlevel);
                if (ssr.error) return client.say(channel, `${ssr.message}`);
                client.say(channel, ssr.message);
                break;
            default:
                console.log('Hola')
                let cmdHandler = await commandHandler(channel, tags, command, argument, userlevel);
                if (!cmdHandler.exists) return;
                if (cmdHandler.error) return client.say(channel, `${cmdHandler.reason}`);
                let cmd = cmdHandler.command;
                if (!cmd.enabled) return;
                client.say(channel, cmd.message);
                channelInstance.setCooldown(cmd.name, cmd.cooldown)
                return true;
        }
        if (commandCD != 0) {
            channelInstance.setCooldown(command, commandCD);
        }
    }
}

module.exports = message;

function giveUserLevel(channel, tags) {
    let userlevel = 1;
    if (tags.subscriber) {
        userlevel = tags['badge-info'].subscriber + 1;
    }

    if (tags.vip) {
        userlevel = 5;
    }

    if (tags.subscriber) {
        if (tags['badge-info-raw'].split('/')[0] === 'founder') {
            userlevel = 6;
        }
    }

    if (tags.mod) {
        userlevel = 7;
    }

    //* TODO- CHECK IF USER IS EDITOR and set userlevel to 7

    if (tags.username === channel) {
        userlevel = 10;
    }

    return userlevel;
}