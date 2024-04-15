const redeemSchema = require('../schemas/redemptionreward');
const channelSchema = require('../schemas/channel.schema');

async function resetRedemptionCosts(client, channelId) {
    let channel = channelSchema.findOne({ channelID: channelId });
    if (!channel) return;
    if (!channel.premium) return;

    let rewards = await redeemSchema.find({ channelID: channelId, returnToOriginalCost: true });

    if (!rewards) return;

    rewards.forEach(async reward => {
        let data = {
            title: reward.rewardTitle,
            prompt: reward.rewardPrompt,
            cost: reward.originalCost,
        }
        let response = await fetch(`${getUrl()}/rewards/${channelId}/${reward.rewardID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
    });

}

module.exports = resetRedemptionCosts;