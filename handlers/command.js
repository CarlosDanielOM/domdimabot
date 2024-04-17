const COMMAND = require('../class/command');
const CHANNEL = require('../functions/channel')

let specialCommandsFunc = (/\$\(([a-z]+)\s?([a-z0-9]+)?\)/g);

async function commandHandler(channel, tags, command, argument, userLevel) {
    COMMAND.init(channel, argument);
    let exists = await COMMAND.commandExistsInDB(command);
    if (!exists) return { error: true, reason: 'command does not exist', exists: false };
    let cmd = await COMMAND.getCommandFromDB(command);
    if (cmd.error) return { error: true, reason: cmd.reason, exists: false };
    cmd = cmd.command;
    if (cmd.userLevel > userLevel) return { error: true, reason: 'Lo siento, no tienes los permisos suficientes para usar este comando!', exists: true, enabled: true };
    if (!cmd.enabled) return { error: true, reason: 'command is disabled', enabled: false, exists: true };
    let specialRes = await specialCommands(tags, argument, cmd.message, cmd.count, channel);
    if (cmd.type === 'countable') {
        cmd.message = specialRes.cmdFunc;
        await COMMAND.updateCountableCommandInDB(cmd.name, specialRes.count);
    } else {
        cmd.message = specialRes.cmdFunc;
    }

    return { error: false, enabled: true, exists: true, command: cmd }

}

module.exports = commandHandler;

async function specialCommands(tags, argument, cmdFunc, count = 0, channel) {
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
            case 'twitch':
                if (!special[2]) break;
                switch (special[2]) {
                    case 'subs':
                        let totalSubs = await CHANNEL.getTotalSubs(channel);
                        cmdFunc = cmdFunc.replace(special[0], totalSubs.total);
                        break;
                    case 'title':
                        let title = await CHANNEL.getTitle(channel);
                        cmdFunc = cmdFunc.replace(special[0], title);
                        break;
                    case 'channel':
                        cmdFunc = cmdFunc.replace(special[0], channel);
                        break;
                    case 'game':
                        let game = await CHANNEL.getGame(channel);
                        cmdFunc = cmdFunc.replace(special[0], game);
                        break;
                }
                break
            default:
                break;
        }
    }
    return { cmdFunc, count };
}