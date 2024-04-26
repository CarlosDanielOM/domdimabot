const COMMAND = require('../class/command');
const streamers = require('../class/streamers');

async function enableCommand(channel, command) {
    let streamer = await streamers.getStreamer(channel);
    let exists = await COMMAND.commandExistsInDB(command, streamer.user_id);
    if (!exists) return { error: 'Command does not exist', reason: 'command does not exist', enabled: false };
    let enabled = await COMMAND.updateCommandIfActive(command, true, streamer.user_id);
    if (!enabled.updated) return { error: 'Command could not be enabled', reason: 'command could not be enabled', enabled: false };
    return { error: false, enabled: true, command, message: `Command ${command} enabled` };
}

module.exports = enableCommand;