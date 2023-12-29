require('dotenv').config();
const { encrypt, decrypt } = require('./util/crypto');
const db = require('./src/db');
const httpServer = require('./src/server');
const eventsub = require('./src/eventsub');
const bot = require('./src/bot');
const streamerNames = require('./util/streamerNames');
const CLIENT = require('./util/client.js');

async function initialize() {
    await CLIENT.clientConnect();

    db.init();
    await streamerNames.updateNames();

    await httpServer.init();
    eventsub.init();
    await bot.init();
}
  
initialize();
