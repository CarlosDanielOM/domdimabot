const CHANNEL = require('../functions/channel')
const STREAMERS = require('../class/streamers')
const functions = require('../functions');
const { getStreamerHeader } = require('../util/headers')
const vipSchema = require('../schemas/vip')

const days = 24 * 60 * 60 * 1000;

async function addVIPCommand(channel, argument, tags, userLevel = 0) {
    if (userLevel < 6) return { error: true, message: 'No tienes permisos suficientes para ejecutar este comando.', status: 403 };
    if (tags['vip']) return { error: true, message: 'Este usuario ya es VIP.', status: 400 };
    if (tags['mod']) return { error: true, message: 'No puedes agregar VIP a un moderador.', status: 400 };

    if (!argument) return { error: true, message: 'Debes proporcionar un nombre de usuario.', status: 400 };

    let username = argument.split(' ')[0].toLowerCase();
    let duration = argument.split(' ')[1];

    if (!username) return { error: true, message: 'Debes proporcionar un nombre de usuario.', status: 400 };

    let userID = await functions.getUserID(username);
    if (!userID) return { error: true, message: 'Usuario no encontrado.', status: 404 };

    let streamer = await STREAMERS.getStreamer(channel);
    let headers = await getStreamerHeader(channel);

    let vipAdded = await CHANNEL.setVIP(streamer.user_id, headers, userID);

    if (!vipAdded) return { error: true, message: 'No se pudo agregar VIP.', status: 500 };
    if (vipAdded.error) return { error: true, message: vipAdded.message, status: vipAdded.status };

    if (duration) {
        if (isNaN(duration)) return { error: true, message: 'La duración debe ser un número.', status: 400 };
        if (duration < 1) return { error: true, message: 'La duración debe ser mayor a 0.', status: 400 };
        if (duration > 30) return { error: true, message: 'La duración máxima es de 30 días.', status: 400 };
        let now = Date.now();
        let expireTime = now + (duration * days);
        let dateToExpire = new Date(expireTime);
        let expireDate = {
            day: dateToExpire.getDate(),
            month: dateToExpire.getMonth(),
            year: dateToExpire.getFullYear()
        };
        let vipData = new vipSchema({
            username: username,
            userID: userID,
            channel: channel,
            channelID: streamer.user_id,
            duration: duration,
            expireDate: expireDate
        })

        let vipSaved = await vipData.save();

        if (!vipSaved) return { error: true, message: 'No se pudo guardar VIP.', status: 500 };
    }

    return { error: false, message: `${username} ha sido agregado como VIP`, status: 200 };

}

module.exports = addVIPCommand;