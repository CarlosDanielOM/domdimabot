const COMMAND = require('../class/command');

async function disableCommand(channel, command) {
    await COMMAND.init(channel);
    let exists = await COMMAND.commandExistsInDB(command);
    if (!exists) return { error: 'Command does not exist', reason: 'command does not exist', enabled: false };
    let enabled = await COMMAND.updateCommandIfActive(command, false);
    if (!enabled.updated) return { error: 'Command could not be disabled', reason: 'command could not be disabled', enabled: false };
    return { error: false, enabled: true, command, message: `Command ${command} disabled` };
}

module.exports = disableCommand;