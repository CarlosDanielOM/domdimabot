const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventsubSchema = new Schema({
    id: { type: String, required: true },
    status: { type: String, required: true },
    type: { type: String, required: true },
    version: { type: String, required: true },
    condition: { type: Object, required: true },
    created_at: { type: String, required: true },
    transport: { type: Object, required: true },
    cost: { type: Number, required: true },
    channel: { type: String, required: true },
    channelID: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    message: { type: String, default: '' },
    endMessage: { type: String, default: '' },
    endEnabled: { type: Boolean, default: false },
    minViewers: { type: Number, default: 2 },
    temporalBanMessage: { type: String, default: '' },
    clipEnabled: { type: Boolean, default: false },
});

module.exports = mongoose.model('eventsub', eventsubSchema);