require('dotenv').config();
const { encrypt, decrypt } = require('./util/crypto');
const axios = require('axios');
const db = require('./src/db');
const httpServer = require('./src/server');
const eventsub = require('./src/eventsub');
const bot = require('./src/bot');
const streamerNames = require('./util/streamerNames');
const CLIENT = require('./util/client.js');
const { refreshAllTokens } = require('./util/token');
const dev = require('./util/dev');

async function initialize() {
    await CLIENT.clientConnect();

    db.init();
    await streamerNames.updateNames();

    await httpServer.init();
    eventsub.init();
    await bot.init();
    await dev.refreshAllTokens(refreshAllTokens, streamerNames.updateNames);

    setInterval(async () => {
        await dev.refreshAllTokens(refreshAllTokens, streamerNames.updateNames);
    }, 1000 * 60 * 60 * 4);
}

initialize();