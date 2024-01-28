const COMMAND = require('../class/command');
const TIME = require('../class/time');

commandPermissionLevels = {
    0: 'everyone',
    1: 'tier1',
    2: 'tier2',
    3: 'tier3',
    4: 'vip',
    5: 'founder',
    6: 'mod',
    7: 'editor',
    8: 'broadcaster'
}

commandPermissions = {
    'everyone': 0,
    'tier1': 1,
    'tier2': 2,
    'tier3': 3,
    'vip': 4,
    'founder': 5,
    'mod': 6,
    'editor': 7,
    'broadcaster': 8
}

const cmdOptionsExistsRegex = new RegExp(/^\-([a-z]+\=[a-zA-Z0-9]+)(?:\W)?(.*)?$/);
const firstCmdOptionRegex = new RegExp(/([a-z]+\=[a-zA-Z0-9]+)(?:\W)?(.*)?$/)
const cmdOptionValueRegex = new RegExp(/([a-z]+)\=([a-zA-Z0-9]+)?$/);

let maxFuncLength = 300;

async function command(action, channel, argument, type = null) {
    await COMMAND.init(channel, argument);
    let cmdOptions = {
        name: null,
        description: null,
        type: null,
        enabled: true,
        cooldown: 20,
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
                    if (opt.value.length > 1) {
                        let userLevelName = commandPermissions[opt.value];
                        if (userLevelName) {
                            cmdOptions.userLevel = parseInt(userLevelName);
                            cmdOptions.userLevelName = opt.value;
                        } else {
                            return { error: true, reason: `user level ${opt.value} does not exist` };
                        }
                    } else {
                        let userLevel = parseInt(opt.value);
                        let value = commandPermissionLevels[userLevel];
                        if (userLevel) {
                            cmdOptions.userLevelName = value;
                            cmdOptions.userLevel = userLevel;
                        } else {
                            return { error: true, reason: `user level ${opt.value} does not exist` };
                        }
                    }
                    break;
            }
        }

        let opts = text.split(' ');
        let name = opts[0];

        let funcLength = opts.length;
        for (let i = 2; i < funcLength; i++) {
            opts[1] += ` ${opts[i]}`;
        }
        let func = opts[1];

        if (func.length > maxFuncLength) return { error: true, reason: `command cannot be longer than ${maxFuncLength} characters` };

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
        let exists = await COMMAND.commandExistsInDB(argument);
        if (!exists) return { error: true, reason: 'command does not exist' };
        let cmd = await COMMAND.getCommandFromDB(argument);
        cmd = cmd.command;
        let deleted = await COMMAND.deleteCommandFromDB(cmd);
        if (!deleted) return { error: true, reason: 'command could not be deleted' };
        return { error: false, message: `Command !${cmd.name} deleted!` };
    }

    if (action === 'EDIT') {
        let { options, text } = getCMDOpt(argument);
        let opts = text.split(' ');
        let name = opts[0];

        let extis = await COMMAND.commandExistsInDB(name);
        if (!extis) return { error: true, reason: 'command does not exist' };

        let oldCommand = await COMMAND.getCommandFromDB(name);
        oldCommand = oldCommand.command;

        for (let i = 0; i < options.length; i++) {
            let opt = options[i];
            switch (opt.name) {
                case 'cd':
                    oldCommand.cooldown = parseInt(opt.value);
                    break;
                case 'ul':
                    if (opt.value.length > 1) {
                        let userLevelName = commandPermissions[opt.value];
                        if (userLevelName) {
                            oldCommand.userLevel = parseInt(userLevelName);
                            oldCommand.userLevelName = opt.value;
                        } else {
                            return { error: true, reason: `user level ${opt.value} does not exist` };
                        }
                    } else {
                        let userLevel = parseInt(opt.value);
                        let value = commandPermissionLevels[userLevel];
                        if (userLevel) {
                            oldCommand.userLevelName = value;
                            oldCommand.userLevel = userLevel;
                        } else {
                            return { error: true, reason: `user level ${opt.value} does not exist` };
                        }
                    }
                    break;
            }
        }

        if (opts[1]) {
            let funcLength = opts.length;
            for (let i = 2; i < funcLength; i++) {
                opts[1] += ` ${opts[i]}`;
            }
            let func = opts[1];

            if (func.length > maxFuncLength) return { error: true, reason: `command cannot be longer than ${maxFuncLength} characters` };

            oldCommand.func = func;
        }

        let updated = await COMMAND.updateCommandInDB(oldCommand);

        if (updated.error) return { error: true, reason: updated.reason };

        return { error: false, message: `Command !${oldCommand.name} updated!` };
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