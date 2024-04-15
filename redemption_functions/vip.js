const CHANNEL = require('../functions/channel');
const { getStreamerHeader } = require('../util/headers');
const rewardSchema = require('../schemas/redemptionreward');
const { getUrl } = require('../util/dev');

async function vipRedemtionFun(eventData, rewardData) {
    const { broadcaster_user_id, broadcaster_user_login, user_id } = eventData;
    let headers = await getStreamerHeader(broadcaster_user_login);

    let vipReward = await rewardSchema.findOne({ channelID: broadcaster_user_id, rewardID: rewardData.id, rewardType: 'vip' });

    if (!vipReward) return { error: true, reason: 'VIP reward not found' };

    if (vipReward.rewardCostChange > 0) {
        let newCost = vipReward.rewardCost + vipReward.rewardCostChange;
        let response = await fetch(`${getUrl()}/rewards/${broadcaster_user_login}/${rewardData.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rewardCost: newCost
            })
        });
    }

    if (rewardData.title === 'VIP') {
        let result = await CHANNEL.setVIP(broadcaster_user_id, headers, user_id);
        if (result.error) return { error: true, reason: result.message };
        if (result.status !== 204) return { error: true, reason: 'Error setting VIP' };
        return { error: false, message: 'VIP set', rewardMessage: vipReward.message };
    }

}

module.exports = vipRedemtionFun;