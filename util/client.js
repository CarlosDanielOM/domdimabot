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
        try {
            await client.join(channel);
        } catch (error) {
            console.error('Error connecting to channel:', error);
        }
    });
};

function connectChannel(channel) {
    try {
        client.join(channel);
    } catch (error) {
        console.error('Error connecting to channel:', error);
    }
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