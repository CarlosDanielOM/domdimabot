require('dotenv').config();
const tmi = require('tmi.js');
const streamerNames = require('./streamerNames'); 

let client = null;

const options = {
    options: {
        debug: true,
    },
    identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.User_Token_Auth,
    },
    channels: ['domdimabot'],
};

async function clientConnect() {
    client = new tmi.client(options);
    await client.connect();
    client.on('connected', (address, port) => {
        console.log(`* Twitch Client Connected to ${address}:${port}`);
    });
}

function getClient() {
    return client;
}

async function connectChannels() {
    const joinableChannels = streamerNames.getNames();

    joinableChannels.forEach(async (channel) => {
        client.join(channel);
    });
};

function connectChannel(channel) {
    client.join(channel);
};

module.exports = {
    clientConnect,
    getClient,
    connectChannels,
    connectChannel
};