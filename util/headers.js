require('dotenv').config();
const STREAMER = require('../class/streamers');

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
    let streamerToken = await STREAMER.getStreamerTokenByName(streamer);
    header.Authorization = `Bearer ${streamerToken}`;
    return header;
}

async function getBotHeader() {
    let botToken = await STREAMER.getStreamerTokenByName('domdimabot');
    botHeaders.Authorization = `Bearer ${botToken}`;
    return botHeaders;
}

async function getStreamerHeaderById(streamerId) {
    let streamerToken = await STREAMER.getStreamerTokenById(streamerId);
    header.Authorization = `Bearer ${streamerToken}`;
    return header;
}

async function getModHeader() { }

module.exports = {
    getStreamerHeader,
    getBotHeader,
    getModHeader,
    getStreamerHeaderById
}