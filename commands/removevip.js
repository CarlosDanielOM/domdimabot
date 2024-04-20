const streamers = require("../class/streamers");
const getUserID = require("../functions/getuserid");
const CHANNEL = require("../functions/channel");
const { getStreamerHeaderById } = require("../util/headers");

async function removeVIPCOmmand(channel, argument, userLevel) {
    if (userLevel < 8) return { error: true, message: 'No tienes permisos suficientes para ejecutar este comando.', status: 403 };
    if (!argument) return { error: true, message: 'Debes proporcionar un nombre de usuario.', status: 400 };

    let streamer = await streamers.getStreamer(channel);

    let headers = await getStreamerHeaderById(streamer.user_id);

    let username = argument.split(' ')[0].toLowerCase();
    let userID = await getUserID(username);
    if (!userID) return { error: true, message: 'Usuario no encontrado.', status: 404 };

    let vipRemoved = await CHANNEL.removeVIP(streamer.user_id, headers, userID);
    if (!vipRemoved) return { error: true, message: 'No se pudo remover VIP.', status: 500 };
    if (vipRemoved.error) return { error: true, message: vipRemoved.message, status: vipRemoved.status };

    return { error: false, message: `${username} ha sido removido como VIP`, status: 200 };
}

module.exports = removeVIPCOmmand;