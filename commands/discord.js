const CLIENT = require('../util/client.js');

const client = CLIENT.getClient();

function discord(client, channel, message) {
    client.say(channel, message);
}

module.exports = discord;