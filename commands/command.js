const COMMAND = require('../class/command');
const TIME = require('../class/time');
const STREAMERS = require('../class/streamers');
const commandTimerSchema = require('../schemas/command_timer')

commandPermissionLevels = {
    1: 'everyone',
    2: 'tier1',
    3: 'tier2',
    4: 'tier3',
    5: 'vip',
    6: 'founder',
    7: 'mod',
    8: 'editor',
    9: 'admin',
    10: 'broadcaster'
}

commandPermissions = {
    'everyone': 1,
    'tier1': 2,
    'tier2': 3,
    'tier3': 4,
    'vip': 5,
    'founder': 6,
    'mod': 7,
    'editor': 8,
    'admin': 9,
    'broadcaster': 10
}

const cmdOptionsExistsRegex = new RegExp(/^\-([a-z]+\=[a-zA-Z0-9]+)(?:\W)?(.*)?$/);
const firstCmdOptionRegex = new RegExp(/([a-z]+\=[a-zA-Z0-9]+)(?:\W)?(.*)?$/)
const cmdOptionValueRegex = new RegExp(/([a-z]+)\=([a-zA-Z0-9]+)?$/);
const specialCommandsFunc = (/\$\((.*?)\)/g);

let maxFuncLength = 300;

async function command(action, channel, argument, type = null) {
    let streamer = await STREAMERS.getStreamer(channel);

    let cmdOptions = {
        name: null,
        cmd: null,
        type: null,
        cooldown: 10,
        channel: channel,
        channelID: streamer.user_id,
        userLevel: 1,
        userLevelName: 'everyone',
        func: null,
        message: null
    }
    if (action === 'CREATE') {
        let time = TIME.getDateinString();

        let { options, text } = getCMDOpt(argument);

        for (let i = 0; i < options.length; i++) {
            let opt = options[i];
            switch (opt.name) {
                case 'cd':
                    console.log({ opt })
                    if (Number(opt.value) >= 5) {
                        cmdOptions.cooldown = parseInt(opt.value);
                    } else {
                        cmdOptions.cooldown = 20;
                    }
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

        if (!func) return { error: true, reason: 'command cannot be empty' };
        if (func.length > maxFuncLength) return { error: true, reason: `command cannot be longer than ${maxFuncLength} characters` };

        cmdOptions.name = name;
        cmdOptions.func = name;
        cmdOptions.message = func;
        cmdOptions.type = type;
        cmdOptions.cmd = name;

        if (specialCommands(null, null, cmdOptions.message)) {
            cmdOptions.type = 'countable';
        }

        let cmd = await COMMAND.createCommand(cmdOptions, streamer.user_id);

        if (cmd.created) {
            return { error: false, message: `Command !${cmd.command.name} created!`, command: cmd.command };
        } else {
            return { error: true, reason: cmd.reason };
        }
    }

    if (action === 'DELETE') {
        let exists = await COMMAND.commandExistsInDB(argument, streamer.user_id);
        if (!exists) return { error: true, reason: 'command does not exist' };
        let cmd = await COMMAND.getCommandFromDB(argument, streamer.user_id);
        cmd = cmd.command;
        if (cmd.reserved) return { error: true, reason: 'You cannot delete a reserved command' };
        let commandTimerExists = await commandTimerSchema.findOne({ command: cmd.cmd, channelID: streamer.user_id });
        if (commandTimerExists) return { error: true, reason: 'You cannot delete a command that is part of a Timer' };
        let deleted = await COMMAND.deleteCommandFromDB(cmd, streamer.user_id);
        if (!deleted) return { error: true, reason: 'command could not be deleted' };
        return { error: false, message: `Command !${cmd.name} deleted!` };
    }

    if (action === 'EDIT') {
        let { options, text } = getCMDOpt(argument);
        let opts = text.split(' ');
        let name = opts[0];

        let oldCommand = '';

        let exist = await COMMAND.commandExistsInDB(name, streamer.user_id);
        if (!exist) {
            let reservedExist = await COMMAND.reservedCommandExistsInDB(name, streamer.user_id);
            if (reservedExist) {
                oldCommand = await COMMAND.getReservedCommandFromDB(name, streamer.user_id);
            } else {
                return { error: true, reason: 'command does not exist' };
            }
        } else {
            oldCommand = await COMMAND.getCommandFromDB(name, streamer.user_id);
        }

        if (oldCommand.error) return { error: true, reason: oldCommand.reason };

        oldCommand = oldCommand.command;

        for (let i = 0; i < options.length; i++) {
            let opt = options[i];
            switch (opt.name) {
                case 'cd':
                    if (opt.value >= 5 || (oldCommand.func == "speach")) {
                        oldCommand.cooldown = parseInt(opt.value);
                    } else {
                        oldCommand.cooldown = 20;
                    }
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
            if (!oldCommand.reserved) {
                if (specialCommands(null, null, func)) {
                    oldCommand.type = 'countable';
                }
                oldCommand.message = func;
            }
        }

        let updated = await COMMAND.updateCommandInDB(oldCommand, streamer.user_id);

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

function specialCommands(tags, argument, cmdFunc) {
    let countable = false;
    let specials = cmdFunc.match(specialCommandsFunc) || [];
    for (let i = 0; i < specials.length; i++) {
        specialCommandsFunc.lastIndex = 0;
        let special = specialCommandsFunc.exec(cmdFunc);
        switch (special[1]) {
            case 'count':
                countable = true;
                break;
            case 'scount':
                countable = true;
                break;
            default:
                break;
        }
    }
    return countable;
}