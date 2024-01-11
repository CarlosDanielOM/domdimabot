const CLIENT = require('../util/client.js');

const client = CLIENT.getClient();

function discord(channel) {
    return {
        message: `Unete a mi discord: https://discord.cdom201.com`
    }
}

module.exports = discord;