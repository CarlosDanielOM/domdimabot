const COMMAND = require('../class/command');

let specialCommandsFunc = (/\$\((.*?)\)/g);

async function commandHandler(channel, tags, command, argument, userLevel) {
    COMMAND.init(channel, argument);
    let exists = await COMMAND.commandExistsInDB(command);
    if (!exists) return { error: true, reason: 'command does not exist', exists: false };
    let cmd = await COMMAND.getCommandFromDB(command);
    if (cmd.error) return { error: true, reason: cmd.reason, exists: false };
    cmd = cmd.command;
    if (cmd.userLevel > userLevel) return { error: true, reason: 'Lo siento, no tienes los permisos suficientes para usar este comando!', exists: true, enabled: true };
    if (!cmd.enabled) return { error: true, reason: 'command is disabled', enabled: false, exists: true };
    cmd.func = specialCommands(tags, argument, cmd.func);

    return { error: false, enabled: true, exists: true, command: cmd }

}

module.exports = commandHandler;

function specialCommands(tags, argument, cmdFunc) {
    let specials = cmdFunc.match(specialCommandsFunc) || [];
    for (let i = 0; i < specials.length; i++) {
        specialCommandsFunc.lastIndex = 0;
        let special = specialCommandsFunc.exec(cmdFunc);
        switch (special[1]) {
            case 'user':
                cmdFunc = cmdFunc.replace(special[0], tags['display-name']);
                break;
            case 'touser':
                if (argument) {
                    cmdFunc = cmdFunc.replace(special[0], argument);
                } else {
                    cmdFunc = cmdFunc.replace(special[0], tags['display-name']);
                }
                break;
            case 'random':
                let random = Math.floor(Math.random() * 100) + 1;
                cmdFunc = cmdFunc.replace(special[0], random);
                break;
            default:
                break;
        }
    }
    return cmdFunc;
}