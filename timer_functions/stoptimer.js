const streamers = require('../class/streamers');
const timerService = require('./timer.service');

async function stopTimerCommands(client, evenData) {
    let { broadcaster_user_id } = evenData;
    let streamer = await streamers.getStreamerById(broadcaster_user_id);
    let timers = timerService.getTimer(streamer.name);

    if (!timers) return;

    console.log(timers);

    for(let i = 0; i < timers.length; i++) {
        console.log('Clearing timer: ', timers[i].cmd, ' index: ', i, ' of ', timers.length);
        timerService.clearTimer(streamer.name, timers[i].cmd);
    }

    console.log('Timers stopped.');

    console.log(timerService.getTimers(streamer.name));

    return;

}

module.exports = stopTimerCommands;