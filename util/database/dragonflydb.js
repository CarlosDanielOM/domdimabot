const redis = require('redis');

let client;

async function init() {
    client = new redis.createClient({
        url: process.env.DRAGONFLYDB_URL,
    })

    client.connect();

    client.on('connect', () => {
        console.log('Connected to DragonflyDB');
    });

    client.on('error', (error) => {
        console.log('Error connecting to DragonflyDB: ', error);
    });

    client.on('end', () => {
        console.log('Disconnected from DragonflyDB');
    });
}

function getClient() {
    return client;
}

module.exports = {
    init,
    getClient,
};