const mongoose = require('mongoose');

const schema = mongoose.Schema;

const redemptionRewardSchema = new schema({
    eventsubID: { type: String, required: true },
    channelID: { type: String, required: true },
    channel: { type: String, required: true },
    rewardID: { type: String, required: true },
    rewardTitle: { type: String, required: true },
    rewardType: { type: String, default: 'custom' },
    rewardPrompt: { type: String, defualt: '' },
    rewardOriginalCost: { type: Number, required: true },
    rewardCost: { type: Number, required: true },
    rewardIsEnabled: { type: Boolean, defualt: true },
    rewardMessage: { type: String, defualt: '' },
    rewardCostChange: { type: Number, defualt: 0 },
    returnToOriginalCost: { type: Boolean, defualt: false },
    rewardDuration: { type: Number, defualt: 0 },
    cooldown: { type: Number, defualt: 0 },
});

module.exports = mongoose.model('redemptionreward', redemptionRewardSchema);