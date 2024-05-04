const func = require('../functions');
const triggerSchema = require('../schemas/trigger');
const triggerFileSchema = require('../schemas/triggerfile');
const rewardSchema = require('../schemas/redemptionreward');
const vipRedemtionFun = require('../redemption_functions/vip');
const customRedemptionReward = require('../redemption_functions/custom');
const { getUrl } = require('../util/dev');

const textConvertor = require('./text');

let modID = '698614112';

let timeoutID = '886b8287-70fe-4e54-a071-aadd5a4922a8'

async function redeem(client, eventData) {
    const { sendTrigger } = require('../src/server');
    const { broadcaster_user_id, broadcaster_user_login, user_id, user_login, user_input } = eventData;
    const { reward } = eventData;

    let vipMatch = reward.title.match(/VIP/);

    if (vipMatch) {
        let result = await vipRedemtionFun(eventData, reward);
        if (result.error) return client.say(broadcaster_user_login, `${result.message}`);
        let message = await textConvertor(broadcaster_user_id, eventData,result.rewardMessage, reward )
        client.say(broadcaster_user_login, `${message.message}`);
        return { error: false, message: 'VIP set' };
    }

    let trigger = await triggerSchema.findOne({ channelID: broadcaster_user_id, name: reward.title, type: 'redemption' }, 'file mediaType volume rewardID');

    if (!trigger) {
        let result = await customRedemptionReward(eventData, reward);
        if (result.error) return client.say(broadcaster_user_login, `${result.message}`);
        let message = await textConvertor(broadcaster_user_id, eventData, result.rewardMessage, reward)
        client.say(broadcaster_user_login, `${message.message}`);
        return { error: false, message: 'Reward Redeemed' };
    };

    let file = await triggerFileSchema.findOne({ name: trigger.file, fileType: trigger.mediaType }, 'fileUrl fileType');

    let customReward = await rewardSchema.findOne({ channelID: broadcaster_user_id, rewardID: trigger.rewardID});

    if (!file) return;

    let url = file.fileUrl;

    let triggerData = {
        url: url,
        mediaType: file.fileType,
        volume: trigger.volume
    }

    if (customReward.rewardCostChange > 0) {
        let newCost = customReward.rewardCost + customReward.rewardCostChange;
        let data = {
            title: customReward.rewardTitle,
            prompt: customReward.rewardPrompt,
            cost: newCost,
        }
        let response = await fetch(`${getUrl()}/rewards/${broadcaster_user_login}/${trigger.rewardID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.error) {
            console.log({ response, where: 'TriggerPriceUpdate', for: 'customReward.rewardCostChange > 0' })
            return { error: true, message: 'Error updating reward cost' }
        };
    }

    sendTrigger(broadcaster_user_login, triggerData);

}

module.exports = redeem;