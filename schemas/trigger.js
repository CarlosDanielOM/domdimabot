const moongoose = require('mongoose');
const Schema = moongoose.Schema;

const triggerSchema = new Schema({
    name: { type: String, required: true }, // The name of the reward
    channel: { type: String, required: true },
    channelID: { type: String, required: true },
    rewardID: { type: String, required: true },
    file: { type: String, required: true }, // The name of the file name on fileSchema
    fileID: { type: Schema.Types.ObjectId, required: true }, // The id of the file on fileSchema
    type: { type: String, default: 'redemption' },
    mediaType: { type: String, required: true }, // The type of media to be played in mime type
    volume: { type: Number, default: 100 },
    cost: { type: Number, default: 1 },
    cooldown: { type: Number, default: 0 }, // The cooldown in seconds
    createdAt: { type: Date, default: Date.now },
    date: {
        day: { type: Number, default: () => new Date().getDate() },
        month: { type: Number, default: () => new Date().getMonth() + 1 },
        year: { type: Number, default: () => new Date().getFullYear() },
    }
});

module.exports = moongoose.model('Trigger', triggerSchema);