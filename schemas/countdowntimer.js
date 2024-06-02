const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const countdowntimerSchema = new Schema({
    channel: {type: String, required: true},
    channelID: {type: String, required: true},
    startTime: {type: Number, required: true},
    resumedAt: {type: Date},
    pausedAt: {type: Date},
    time: {type: Number, default: 0},
    paused: {type: Boolean, default: false},
    active: {type: Boolean, default: true},
});

module.exports = mongoose.model('Countdowntimer', countdowntimerSchema);