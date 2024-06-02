require('dotenv').config();
const { connectChannels } = require('../util/dev');

const CLIENT = require('../util/client');
const messages = require('../handlers/message');
const redeem = require('../handlers/redeem');
const raid = require('../handlers/raided');

const countdowntimerCommand = require('../commands/countdowntimer');

let client = null;

let newChatter = false;

async function init() {

    client = await CLIENT.getClient();

    await connectChannels(CLIENT.connectChannels, client);

    client.on('resub', (channel, username, months, message, userstate, methods) => {
        let tier = userstate['msg-param-sub-plan'];
        switch (tier) {
            case 'Prime':
                tier = 'Prime';
                countdowntimerCommand(channel.replace('#', ''), 'tier1', 10);
                break;
            case '1000':
                tier = '1';
                countdowntimerCommand(channel.replace('#', ''), 'tier1', 10);
                break;
            case '2000':
                tier = '2';
                countdowntimerCommand(channel.replace('#', ''), 'tier2', 10);
                break;
            case '3000':
                tier = '3';
                countdowntimerCommand(channel.replace('#', ''), 'tier3', 10);
                break;
        }

        if (months == 0) { months++ }

        client.say(channel, `Gracias por la resub ${username}! de ${months} meses y de nivel ${tier}!`);
    });

    client.on('subscription', (channel, username, method, message, userstate) => {
        let tier = userstate['msg-param-sub-plan'];
        switch (tier) {
            case 'Prime':
                tier = 'Prime';
                break;
            case '1000':
                tier = '1';
                break;
            case '2000':
                tier = '2';
                break;
            case '3000':
                tier = '3';
                break;
        }

        client.say(channel, `Gracias por la sub ${username} de nivel ${tier}!`);
    })

    client.on('message', async (channel, tags, message, self) => {
        if (self) return;

        await messages(client, channel.replace('#', ''), tags, message);
    });

    client.on('cheer', (channel, tags, message) => {
        client.say(channel, `Gracias por los ${tags.bits} bits ${tags['display-name']}!`)
        countdowntimerCommand(channel.replace('#', ''), `bits ${tags.bits}`, 10);
    });

}

module.exports = {
    init
}