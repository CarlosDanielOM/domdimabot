const STREAMER = require('../class/streamers');
const commandTimerSchema = require('../schemas/command_timer');
commandsSchema = require('../schemas/command');

async function editTimerCommand(channel, argument, userLevel) {
    let streamer = await STREAMER.getStreamer(channel);
    let commandInfo = await commandsSchema.findOne({ channelID: streamer.user_id, func: 'editCommandTimer' });

    if(!commandInfo) return {error: true, message: 'Command not found.'};

    if(userLevel < commandInfo.userLevel) return {error: true, message: 'You do not have permission to use this command.'};

    if(!argument) return {error: true, message: 'Invalid arguments. Usage: !ect <command> <time in minutes>'};
    
    const [command, time] = argument.split(' ');

    if(!command || !time) return {error: true, message: 'Invalid arguments. Usage: !ect <command> <time in minutes>'};

    let commandExists = await commandTimerSchema.findOne({ channelID: streamer.user_id, command: command });

    if(!commandExists) return {error: true, message: `Command ${command} does not exist.`};

    commandExists.timer = time;

    await commandExists.save();

    return {error: false, message: `Timer command ${command} edited for every ${time} minutes.`};
}

module.exports = editTimerCommand;