const { timeoutUser, getUserID } = require('../functions/index');
const CHANNEL = require('../functions/channel/index');

let commandOptions = {
    name: 'ruletarusa',
    cmd: 'ruletarusa',
    func: 'ruletarusa',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'everyone',
    userLevel: 0,
    enabled: true,
    description: 'Tiraras del gatillo y si tenia bala te mueres',
    premium: false,
    premium_config: {
        timeout_user: {
            enabled: false
        },
        timeout_mod: {
            enabled: false
        }
    }
};

async function ruletarusa(channel, user, modID, isMod) {
    let premiumLevel = 2;

    let timeoutRes = null;
    let modRes = null;

    await CHANNEL.init(channel);
    let probability = Math.floor(Math.random() * 120) + 1;
    let dead = false;
    if (probability % 3 === 0) dead = true;

    let broadcasterID = await getUserID(channel);
    let userID = await getUserID(user);

    if (!dead) return { error: false, status: 200, message: `${user} ha jalado el gatillo y la bala no ha sido disparada.` };

    if (!isMod) {
        timeoutRes = await timeoutUser(broadcasterID, userID, modID, 150, 'Ruleta rusa');
        if (timeoutRes.status === 401) {
            return { error: true, status: 401, reason: 'No tengo permisos para banear usuarios!' }
        };
        return { error: false, status: 200, message: `${user} ha jalado el gatillo y la bala ha sido disparada causando su muerte.` };
    }

    if (premiumLevel < 2) {
        return { error: false, status: 200, message: `No puedes disparatete como un mod, no seas pendejo.` }
    }

    modRes = await CHANNEL.deleteModerator(channel, userID);
    if (modRes.error) return modRes;

    let timeout = await timeoutUser(broadcasterID, userID, modID, 150, 'Ruleta rusa');

    if (timeout.status === 401) {
        modRes = await CHANNEL.setModerator(channel, userID);
        if (modRes.error) return modRes;
        return { error: true, status: 401, reason: 'No tengo permisos para banear usuarios!' }
    };

    setTimeout(async () => {
        modRes = await CHANNEL.setModerator(channel, userID);
        if (modRes.error) console.log(modRes)
    }, 1000 * 160);

    return { error: false, status: 200, message: `${user} ha jalado el gatillo y la bala ha sido disparada causando su muerte.`, cooldown: commandOptions.cooldown };
}

module.exports = ruletarusa;