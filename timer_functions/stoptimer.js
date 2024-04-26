const streamers = require('../class/streamers');
const timerService = require('./timer.service');

async function stopTimerCommands(client, evenData) {
    let { broadcaster_user_id } = evenData;
    let streamer = await streamers.getStreamerById(broadcaster_user_id);
    let timers = timerService.getTimer(streamer.name);

    if (!timers) return;

    for(let i = timers.length - 1; i >= 0; i--) {
        timerService.clearTimer(streamer.name, timers[i].cmd);
    }

    return;

}

module.exports = stopTimerCommands;