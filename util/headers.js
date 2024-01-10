require('dotenv').config();
const { getUserToken } = require('./streamerNames');

let botHeaders = {
    'Authorization': null,
    'Client-Id': process.env.CLIENT_ID,
    'Content-Type': 'application/json'
}

let header = {
    'Authorization': null,
    'Client-Id': process.env.CLIENT_ID,
    'Content-Type': 'application/json'
}

async function getStreamerHeader(streamer) {
    let streamerToken = await getUserToken(streamer);
    header.Authorization = `Bearer ${streamerToken}`;
    return header;
}

async function getBotHeader() {
    let botToken = await getUserToken('domdimabot');
    botHeaders.Authorization = `Bearer ${botToken}`;
    return botHeaders;
}

async function getModHeader() { }

module.exports = {
    getStreamerHeader,
    getBotHeader,
    getModHeader
}