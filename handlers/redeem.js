const func = require('../functions');

let modID = '698614112';

let timeoutID = '886b8287-70fe-4e54-a071-aadd5a4922a8'

async function redeem(client, eventData) {
    if (rewardType === timeoutID) {
        let streamerID = await func.getUserID(channel);

        let user = message.replace('@', '');
        let userID = await func.getUserID(user);

        let timeout = await func.timeoutUser(streamerID, userID, modID, 300, 'Por canje de puntos');

        client.say(channel, `${tags['display-name']} ha fusilado a ${user} por 5 min.`);
    }

    console.log(eventData);
}

module.exports = redeem;

//! free basic noramal premium