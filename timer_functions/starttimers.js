const timerService = require('./timer.service');
let timerMap = new Map();
const commandSchema = require('../schemas/command');
const commandTimerSchema = require('../schemas/command_timer');
const STREAMERS = require('../class/streamers');

async function startTimerCommands(client, evenData) {
    let { broadcaster_user_id, broadcaster_user_login } = evenData;
    let timers = await commandTimerSchema.find({ channelID: broadcaster_user_id });

    let streamer = await STREAMERS.getStreamerById(broadcaster_user_id);

    if (!streamer) return;
    if (!timers) return;
    
    await creatingTimers(timers, broadcaster_user_id, streamer, client);
    
}

module.exports = startTimerCommands;

async function creatingTimers(timers, broadcaster_user_id, streamer, client) {
    let timerArray = [];
    await timers.forEach(async (timer) => {
        let command = await commandSchema.findOne({ channelID: broadcaster_user_id, cmd: timer.command });

        if (!command) {
            return;
        };

        let newTimer = setInterval(() => {
            client.say(streamer.name, command.message);
        }, timer.timer * (1000 * 60));

        timerArray.push({ cmd: timer.command, timer: newTimer });

    });

    timerService.addTimer(streamer.name, timerArray);
}