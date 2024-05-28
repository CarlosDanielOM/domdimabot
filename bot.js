require('dotenv').config();
const db = require('./src/db');
const bot = require('./src/bot');
const STREAMERS = require('./class/streamers');
const CLIENT = require('./util/client.js');
const dev = require('./util/dev');

async function initialize() {
    try {
        await CLIENT.clientConnect();
        await db.init();
        await STREAMERS.init();
        await bot.init();
    } catch (error) {
        console.log(error);
    }
}
initialize();

setInterval(async () => {
    await STREAMERS.updateStreamers();
}, 1000 * 60 * 30);