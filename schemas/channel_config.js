const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const channelConfigSchema = new Schema({
    channel_id: Schema.Types.ObjectId,
    channel: String,
    commands: Array,
    createdAt: Date,
    date: {
        day: String,
        month: String,
        year: String
    }
});