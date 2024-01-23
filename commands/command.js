const COMMAND = require('../class/command');
const TIME = require('../class/time');

async function command(action, channel, argument, type = null) {
    await COMMAND.init(channel, argument);
    let cmdOptions = {
        name: null,
        description: null,
        type: null,
        enabled: true,
        cooldown: 15,
        channel: channel,
        userLevel: 0,
        userLevelName: 'everyone',
        func: null,
        createdAt: null,
        date: {
            day: null,
            month: null,
            year: null,
        }
    }
    if (action === 'CREATE') {
        let time = TIME.getDateinString();
        let opts = argument.split(' ');
        let name = opts[0];
        let funcLength = opts.length;
        for (let i = 2; i < funcLength; i++) {
            opts[1] += ` ${opts[i]}`;
        }
        let func = opts[1];

        if (func.includes('!')) return { error: true, reason: 'command cannot contain !' };
        if (func.length > 400) return { error: true, reason: 'command cannot be longer than 400 characters' };

        cmdOptions.createdAt = TIME.getTimeNow();
        cmdOptions.date = {
            day: time.day,
            month: time.month,
            year: time.year
        }
        cmdOptions.name = name;
        cmdOptions.func = func;
        cmdOptions.type = type;

        let cmd = await COMMAND.createCommand(cmdOptions);

        if (cmd.created) {
            return { error: false, message: `Command !${cmd.command.name} created!`, command: cmd.command };
        } else {
            return { error: true, reason: cmd.reason };
        }
    }

    if (action === 'DELETE') {
        console.log({ argument, where: 'command.js' })
        let exists = await COMMAND.commandExistsInDB(argument);
        if (!exists) return { error: true, reason: 'command does not exist' };
        let cmd = await COMMAND.getCommandFromDB(argument);
        cmd = cmd.command;
        let deleted = await COMMAND.deleteCommandFromDB(cmd);
        if (!deleted) return { error: true, reason: 'command could not be deleted' };
        return { error: false, message: `Command !${cmd.name} deleted!` };
    }
}

module.exports = command;