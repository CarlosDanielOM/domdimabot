const COMMAND = require('../class/command');
const STREAMERS = require('../class/streamers');

async function disableCommand(channel, command) {
    let streamer = await STREAMERS.getStreamer(channel);
    let exists = await COMMAND.commandExistsInDB(command, streamer.user_id);
    if (!exists) return { error: 'Command does not exist', reason: 'command does not exist', enabled: false };
    let enabled = await COMMAND.updateCommandIfActive(command, false, streamer.user_id);
    if (!enabled.updated) return { error: 'Command could not be disabled', reason: 'command could not be disabled', enabled: false };
    return { error: false, enabled: true, command, message: `Command ${command} disabled` };
}

module.exports = disableCommand;