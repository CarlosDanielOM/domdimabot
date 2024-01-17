require('dotenv').config();
const tmi = require('tmi.js');
const STREAMERS = require('../class/streamers');
const { getClientOpts } = require('./dev');

let client = null;

const options = getClientOpts();

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
    const joinableChannels = await STREAMERS.getStreamersNames();

    joinableChannels.forEach(async (channel) => {
        client.join(channel);
    });
};

function connectChannel(channel) {
    client.join(channel);
};

function disconnectChannel(channel) {
    client.part(channel);
}

module.exports = {
    clientConnect,
    getClient,
    connectChannels,
    connectChannel,
    disconnectChannel,
};