const mongoose = require('mongoose');
const { Schema } = mongoose;

const commandSchema = new Schema({
    name: String,
    cmd: String,
    func: String,
    type: String,
    description: { type: String, default: 'No description provided.' },
    cooldown: { type: Number, default: 20 },
    userLevelName: { type: String, default: 'everyone' },
    userLevel: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    channel: String,
    channelID: { type: String, required: true },
    premiumRequired: { type: Boolean, default: false },
    premiumLevelRequired: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    date: {
        day: Number,
        month: Number,
        year: Number,
    }
});


module.exports = mongoose.model('Command', commandSchema);