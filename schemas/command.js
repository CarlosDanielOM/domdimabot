const mongoose = require('mongoose');
const { Schema } = mongoose;

const commandSchema = new Schema({
    name: String,
    cmd: String,
    func: String,
    message: { type: String, default: '' },
    responses: { type: Array, default: [] },
    type: { type: String, default: 'command' },
    reserved: { type: Boolean, default: false },
    description: { type: String, default: 'No description provided.' },
    cooldown: { type: Number, default: 20 },
    count: { type: Number, default: 0 },
    userLevelName: { type: String, default: 'everyone' },
    userLevel: { type: Number, default: 0 },
    permissions: { type: Object, default: {} },
    enabled: { type: Boolean, default: true },
    paused: { type: Boolean, default: false },
    channel: String,
    channelID: { type: String, required: true },
    premiumRequired: { type: Boolean, default: false },
    premiumLevelRequired: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    date: {
        day: { type: Number, default: () => new Date().getDate() },
        month: { type: Number, default: () => new Date().getMonth() + 1 },
        year: { type: Number, default: () => new Date().getFullYear() },
    }
});


module.exports = mongoose.model('Command', commandSchema);