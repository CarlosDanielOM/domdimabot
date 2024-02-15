const COMMAND = require('../class/command');

async function enableCommand(channel, command) {
    await COMMAND.init(channel);
    let exists = await COMMAND.commandExistsInDB(command);
    if (!exists) return { error: 'Command does not exist', reason: 'command does not exist', enabled: false };
    let enabled = await COMMAND.updateCommandIfActive(command, true);
    if (!enabled.updated) return { error: 'Command could not be enabled', reason: 'command could not be enabled', enabled: false };
    return { error: false, enabled: true, command, message: `Command ${command} enabled` };
}

module.exports = enableCommand;