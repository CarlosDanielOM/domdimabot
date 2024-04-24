const STREAMERS = require('../class/streamers');
const commandTimerSchema = require('../schemas/command_timer');
const commandsSchema = require('../schemas/command');

async function createTimerCommand(channel, argument, userLevel) {
    let streamer = await STREAMERS.getStreamer(channel);
    
    let commandInfo = await commandsSchema.findOne({ channelID: streamer.user_id, name: 'Create Timer Command' });

    if (!commandInfo) {
        return {error: true, message: 'Command not found.'};
    }

    if (userLevel < commandInfo.userLevel) {
        return {error: true, message: 'You do not have permission to use this command.'};
    }
    
    const [command, time] = argument.split(' ');

    if (!command || !time) return {error: true, message: 'Invalid arguments. Usage: !cct <command> <time in minutes>'};

    let commandExists = await commandsSchema.findOne({ channelID: streamer.user_id, cmd: command });

    if (!commandExists) return {error: true, message: `Command ${command} does not exist.`};
    
    let timerData = {
        command: command,
        timer: time,
        channel: channel,
        channelID: streamer.user_id,
    }

    let timer = new commandTimerSchema(timerData);
    await timer.save();

    return {error: false, message: `Timer command ${command} created for every ${time} minutes.`};
}

module.exports = createTimerCommand;