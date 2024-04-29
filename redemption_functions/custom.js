const CHANNEL = require('../functions/channel');
const { getStreamerHeader } = require('../util/headers');
const rewardSchema = require('../schemas/redemptionreward');
const vipSchema = require('../schemas/vip');
const { getUrl } = require('../util/dev');

async function customRedemptionReward(eventData, rewardData) {
    const { broadcaster_user_id, broadcaster_user_login, user_id } = eventData;
    let headers = await getStreamerHeader(broadcaster_user_login);

    let customReward = await rewardSchema.findOne({ channelID: broadcaster_user_id, rewardID: rewardData.id, rewardType: 'custom' });

    if (!customReward) return { error: false, message: '' };

    if (customReward.rewardCostChange > 0) {
        let newCost = customReward.rewardCost + customReward.rewardCostChange;
        let data = {
            title: customReward.rewardTitle,
            prompt: customReward.rewardPrompt,
            cost: newCost,
        }
        let response = await fetch(`${getUrl()}/rewards/${broadcaster_user_login}/${rewardData.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.error) {
            console.log({ response, where: 'customRewardRedemtpion', for: 'customReward.rewardCostChange > 0' })
            return { error: true, message: 'Error updating reward cost' }
        };
    }

    return { error: false, message: 'VIP set', rewardMessage: customReward.rewardMessage };

}

module.exports = customRedemptionReward;