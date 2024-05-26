const redeemSchema = require('../schemas/redemptionreward');
const channelSchema = require('../schemas/channel.schema');
const { getUrl } = require('../util/dev');

async function resetRedemptionCosts(client, channelId) {
    let channel = await channelSchema.findOne({ twitch_user_id: channelId });
    if (!channel) return;
    if (!channel.premium) return;

    let rewards = await redeemSchema.find({ channelID: channelId, returnToOriginalCost: true });

    if (!rewards) return;

    rewards.forEach(async reward => {
        let data = {
            title: reward.rewardTitle,
            prompt: reward.rewardPrompt,
            cost: reward.rewardOriginalCost,
        }
        let response = await fetch(`${getUrl()}/rewards/${channel.twitch_user_id}/${reward.rewardID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
    });

}

module.exports = resetRedemptionCosts;