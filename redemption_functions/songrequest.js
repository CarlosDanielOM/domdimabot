const rewardSchema = require('../schemas/reward');

async function songRequestFun(eventData, reward) {
    let userInput = eventData.user_input;
    let rewardData = await rewardSchema.findOne({ channelID: eventData.broadcaster_user_id, rewardID: reward.id });
    if (!rewardData) return { error: true, message: 'No reward data found' };

    if (!userInput) return { error: true, message: 'No user input' };

    let response = await fetch(`https://spotify.domdimabot.com/song/queue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            channelID: eventData.broadcaster_user_id,
            song: userInput
        })
    })

    let data = await response.json();

    if (data.error) return { error: true, message: data.message };

    let rewardMessage = rewardData.rewardMessage;

    return { error: false, message: 'Song queued', rewardMessage };
    
}

module.exports = songRequestFun;