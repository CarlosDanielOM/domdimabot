const dragonflydb = require('../util/database/dragonflydb');

let client;

let supremeFurry = 0;

async function furrometro(channel, username, argument, userlevel) {
    client = await dragonflydb.getClient();
    let furryDay = await client.get(`${channel}:furryDay`);
    furryDay = parseInt(furryDay);
    if (furryDay != new Date().getDay()) {
        client.del(`${channel}:furrymeter`);
        client.set(`${channel}:supremeFurry`, 0);
        client.set(`${channel}:furryDay`, furryDay);
    }

    let exists = await client.get(`${channel}:furrymeter:${username.toLowerCase()}`);
    if(exists) {
        return {error: false, message: `${username} el dia de hoy tiene un nivel de furro del ${exists}%`};
    }

    exists = await client.get(`${channel}:supremeFurry`);
    if (exists) {
        supremeFurry = Number(exists);
    }

    if(argument) {
        exists = await client.get(`${channel}:furrymeter:${argument.toLowerCase()}`);
        if(exists) {
            return {error: false, message: `${argument} el dia de hoy tiene un nivel de furro del ${exists}%`};
        }
    }
    
    let rand = Math.floor(Math.random() * 101);
        
    if (rand > supremeFurry) {
        supremeFurry = rand;
        await client.set(`${channel}:supremeFurry`, supremeFurry, { EX: 60 * 60 * 8 });
    
        await fetch(`https://api.domdimabot.com/overlays/${channel}/furry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                value: supremeFurry,
            }),
        });
    }
    
    client.set(`${channel}:furrymeter:${username.toLowerCase()}`, rand, { EX: 60 * 60 * 8});
    
    return { error: false, message: `${username} tiene un nivel de furro del ${rand}%` };
    
}

module.exports = furrometro;