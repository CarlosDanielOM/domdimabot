const { timeoutUser, getUserID } = require('../functions');

async function ip(channel, user, modID) {
    const userID = await getUserID(user);
    const streamerID = await getUserID(channel);

    await timeoutUser(streamerID, userID, modID, 15, 'Ya quisieras papi');

    return { error: false, message: 'Ya quisieras papi' }
}