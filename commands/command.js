const COMMAND = require('../class/command');
const COOLDOWN = require('../util/cooldowns');

async function command(action, channel, argument) {
    await COMMAND.init(channel, argument);
    if(action === 'CREATE') {
        argument
    }
}

module.exports = command;