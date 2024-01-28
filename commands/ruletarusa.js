const { timeoutUser, getUserID } = require('../functions/index');
const CHANNEL = require('../functions/channel/index');

async function ruletarusa(channel, user, isMod) {
    let premiumLevel = 2;

    CHANNEL.init(channel);
    let probability = Math.floor(Math.random() * 120) + 1;
    let dead = false;
    if (probability % 3 === 0) dead = true;

    let broadcasterID = await getUserID(channel);
    let userID = await getUserID(user);

    if (!dead) return { error: false, status: 200, message: `${user} ha jalado el gatillo y la bala no ha sido disparada.` };

    if (isMod && (premiumLevel < 2)) {
        return { error: false, status: 200, message: `No puedes disparatete como un mod, no seas pendejo.` }
    }

    if (isMod) {
        CHANNEL.deleteModerator(userID);
    }

    let timeout = await timeoutUser(broadcasterID, userID, 150, 'Ruleta rusa');

    if (timeout.status === 401) {
        CHANNEL.setModerator(userID);
        return { error: true, status: 401, reason: 'No tengo permisos para banear usuarios!' }
    };

    setTimeout(() => {
        CHANNEL.setModerator(userID);
    }, 1000 * 160);

    return { error: false, status: 200, message: `${user} ha jalado el gatillo y la bala ha sido disparada causando su muerte.` };
}

module.exports = ruletarusa;