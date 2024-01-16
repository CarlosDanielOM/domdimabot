const mongoose = require('mongoose');
const { Schema } = mongoose;

const commandSchema = new Schema({
    name: String,
    description: String,
    type: String,
    enabled: Boolean,
    cooldown: Number,
    channel: String,
    userLevel: Number,
    userLevelName: String,
    func: String,
    createdAt: Date,
    date: {
        day: Number,
        month: Number,
        year: Number,
    }
});

module.exports = mongoose.model('Command', commandSchema);