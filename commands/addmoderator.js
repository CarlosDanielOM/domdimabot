const CHANNEL = require('../functions/channel/index');
const getUserID = require('../functions/getuserid');

async function addModerator(channel, user, userLevel) {
    if (userLevel < 8) return { error: true, reason: 'No tienes permisos suficientes para realizar esta acción', status: 403 };

    let newModID = await getUserID(user);

    if (newModID.error) {
        return { error: true, reason: newModID.reason, status: newModID.status };
    }

    let newModAction = await CHANNEL.setModerator(channel, newModID);

    if (newModAction.error) {
        return { error: true, reason: newModAction.reason, status: newModAction.status };
    }

    return { error: false, message: `${user} ha sido agregada como moderador`, status: newModAction.status };

}

module.exports = addModerator;