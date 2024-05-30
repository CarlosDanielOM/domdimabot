require('dotenv').config();
const db = require('./src/db');
const httpServer = require('./src/server');
const eventsub = require('./src/eventsub');
const STREAMERS = require('./class/streamers');
const CLIENT = require('./util/client.js');
const { refreshAllTokens, getNewAppToken } = require('./util/token');
const dev = require('./util/dev');
const bot = require('./src/bot');
const DragonflyDB = require('./util/database/dragonflydb');

async function initialize() {
    try {
        await CLIENT.clientConnect();

        await db.init();
        await DragonflyDB.init();
        await STREAMERS.init();

        await httpServer.init();
        eventsub.init();
        bot.init();
        await dev.refreshAllTokens(refreshAllTokens);
    } catch (error) {
        console.log(error);
    }

    // await getNewAppToken();

}

initialize();

setInterval(async () => {
    await dev.refreshAllTokens(refreshAllTokens);
    console.log('Refreshed tokens');
}, 1000 * 60 * 60 * 3);

setInterval(async () => {
    await getNewAppToken();
    console.log('Refreshed app token');
}, 1000 * 60 * 60 * 24);
