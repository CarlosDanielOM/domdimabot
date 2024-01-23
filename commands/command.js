const COMMAND = require('../class/command');
const TIME = require('../class/time');

const cmdOptionsExistsRegex = new RegExp(/^\-([a-z]+\=[a-zA-Z0-9]+)(?:\W)?(.*)?$/);
const firstCmdOptionRegex = new RegExp(/([a-z]+\=[a-zA-Z0-9]+)(?:\W)?(.*)?$/)
const cmdOptionValueRegex = new RegExp(/([a-z]+)\=([a-zA-Z0-9]+)?$/);

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

        let { options, text } = getCMDOpt(argument);

        for (let i = 0; i < options.length; i++) {
            let opt = options[i];
            switch (opt.name) {
                case 'cd':
                    cmdOptions.cooldown = parseInt(opt.value);
                    break;
                case 'ul':
                    cmdOptions.userLevelName = opt.value;
                    break;
            }
        }

        let opts = text.split(' ');
        let name = opts[0];

        console.log({ opts, where: 'command.js' })

        let funcLength = opts.length;
        for (let i = 2; i < funcLength; i++) {
            opts[1] += ` ${opts[i]}`;
        }
        let func = opts[1];

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

function getCMDOpt(text) {
    let options = [];

    let stop = false;

    let [firstRaw, firstOption, resText] = text.match(firstCmdOptionRegex) || [];

    if (!firstRaw) {
        return { options, text };
    }

    text = resText;

    let [firstRawOption, firstOptName, firstOptValue] = firstOption.match(cmdOptionValueRegex) || [];

    options.push({ name: firstOptName, value: firstOptValue });

    while (!stop) {
        let [raw, option, newText] = text.match(cmdOptionsExistsRegex) || [];

        if (raw) {
            let [rawOption, optName, optValue] = option.match(cmdOptionValueRegex);

            options.push({ name: optName, value: optValue });

            text = newText;
        } else {
            stop = true;
        }
    }

    return { options, text };

}