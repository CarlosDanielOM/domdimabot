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
    let specialRes = specialCommands(tags, argument, cmd.message, cmd.count);
    if (cmd.type === 'countable') {
        cmd.message = specialRes.cmdFunc;
        await COMMAND.updateCountableCommandInDB(cmd.name, specialRes.count);
    } else {
        cmd.message = specialRes.cmdFunc;
    }

    return { error: false, enabled: true, exists: true, command: cmd }

}

module.exports = commandHandler;

function specialCommands(tags, argument, cmdFunc, count = 0) {
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
            case 'count':
                if (argument === '' || argument === undefined || argument === ' ') argument = 0;
                if (argument != 0) argument = argument.replace(/\+/g, '');
                if (count === undefined) count = 0;
                let newCount = count + parseInt(argument);
                cmdFunc = cmdFunc.replace(special[0], newCount);
                count = newCount;
                break;
            case 'scount':
                count++;
                cmdFunc = cmdFunc.replace(special[0], count);
            default:
                break;
        }
    }
    return { cmdFunc, count };
}