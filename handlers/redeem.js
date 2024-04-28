const func = require('../functions');
const triggerSchema = require('../schemas/trigger');
const triggerFileSchema = require('../schemas/triggerfile');
const vipRedemtionFun = require('../redemption_functions/vip');

let modID = '698614112';

let timeoutID = '886b8287-70fe-4e54-a071-aadd5a4922a8'

async function redeem(client, eventData) {
    const { sendTrigger } = require('../src/server');
    const { broadcaster_user_id, broadcaster_user_login, user_id, user_login, user_input } = eventData;
    const { reward } = eventData;

    let vipMatch = reward.title.match(/VIP/);

    if (vipMatch) {
        let result = await vipRedemtionFun(eventData, reward);
        console.log({ result })
        if (result.error) return client.say(broadcaster_user_login, `${result.message}`);
        client.say(broadcaster_user_login, `${result.rewardMessage}`);
        return { error: false, message: 'VIP set' };
    }

    let trigger = await triggerSchema.findOne({ channelID: broadcaster_user_id, name: reward.title, type: 'redemption' }, 'file mediaType volume');

    if (!trigger) return;

    let file = await triggerFileSchema.findOne({ name: trigger.file, fileType: trigger.mediaType }, 'fileUrl fileType');

    if (!file) return;

    let url = file.fileUrl;

    let triggerData = {
        url: url,
        mediaType: file.fileType,
        volume: trigger.volume
    }

    sendTrigger(broadcaster_user_login, triggerData);

}

module.exports = redeem;