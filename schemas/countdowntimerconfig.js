const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const countdowntimerconfigSchema = new Schema({
    channel: {type: String, required: true},
    channelID: {type: String, required: true},
    bits: {type: Number, required: true},
    tier1: {type: Number, required: true},
    tier2: {type: Number, required: true},
    tier3: {type: Number, required: true},
    follows: {type: Number, required: true},
    raids: {type: Number, required: true},
    viewers: {type: Number, required: true},
    donations: {type: Number, required: true},
});

module.exports = mongoose.model('Countdowntimerconfig', countdowntimerconfigSchema);