const timerService = require('./timer.service');
let channels = new Map();
const commandSchema = require('../schemas/command')

async function startTimerCommands(client, evenData) {
    let { broadcaster_user_id, broadcaster_user_login } = evenData;
    
}

module.exports = startTimerCommands;