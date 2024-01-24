const COMMAND = require('../class/command');

async function commandHandler(channel, tags, command, argument) {
    COMMAND.init(channel, argument);
    let exists = await COMMAND.commandExistsInDB(command);
    if (!exists) return { error: true, reason: 'command does not exist', exists: false };
    let cmd = await COMMAND.getCommandFromDB(command);
    if (cmd.error) return { error: true, reason: cmd.reason, exists: false };
    cmd = cmd.command;
    if (!cmd.enabled) return { error: true, reason: 'command is disabled', enabled: false, exists: true };

    return { error: false, enabled: true, exists: true, command: cmd }

}

module.exports = commandHandler;