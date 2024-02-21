const mongoose = require('mongoose');

const schema = mongoose.Schema;

const redemptionRewardSchema = new schema({
    eventsubID: { type: String, required: true },
    channelID: { type: String, required: true },
    channel: { type: String, required: true },
    rewardID: { type: String, required: true },
    rewardTitle: { type: String, required: true },
    rewardPrompt: { type: String, defualt: '' },
    rewardCost: { type: Number, required: true },
    rewardIsEnabled: { type: Boolean, defualt: true },
    rewardMessage: { type: String, defualt: '' },
});

module.exports = mongoose.model('redemptionreward', redemptionRewardSchema);