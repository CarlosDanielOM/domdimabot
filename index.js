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

        await httpServer.init();

    } catch (error) {
        console.log(error);
    }

    // await getNewAppToken();

}

initialize();