const STREAMERS = require('../class/streamers');
const commandTimerSchema = require('../schemas/command_timer');

async function deleteTimerCommand(channel, argument, userLevel) {
    let streamer = await STREAMERS.getStreamer(channel);
    let commandInfo = await commandsSchema.findOne({ channelID: streamer.user_id, func: 'deleteCommandTimer' });

    if (!commandInfo) {
        return {error: true, message: 'Command not found.'};
    }

    if (userLevel < commandInfo.userLevel) {
        return {error: true, message: 'You do not have permission to use this command.'};
    }

    if (!argument) return {error: true, message: 'Invalid arguments. Usage: !dct <command>'};

    let commandExists = await commandTimerSchema.findOne({ channelID: streamer.user_id, command: argument });

    if (!commandExists) return {error: true, message: `Command ${argument} does not exist.`};

    await commandExists.delete();

    return {error: false, message: `Timer command ${argument} deleted.`};
}

module.exports = deleteTimerCommand;