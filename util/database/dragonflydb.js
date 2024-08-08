require('dotenv').config();
const redis = require('ioredis');

let client;

module.exports = {
    init: async () => {
        client = new redis({
            port: process.env.DRAGONFLY_PORT,
            host: process.env.DRAGONFLY_HOST
        })

        client.on('connect', _ => {
            console.log(`Connected to DragonFlyDB`);
        })

        client.on('error', error => {
            console.log(`Error connecting to DragonFlyDB: ${error}`)
        })

        client.on('end', () => {
            console.log('Disconected from DragonFlyDB');
        })

    },
    getClient: () => {
        return client
    },
}