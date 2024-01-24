const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventsubSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    version: {
        type: String,
        required: true
    },
    condition: {
        type: Object,
        required: true
    },
    created_at: {
        type: String,
        required: true
    },
    transport: {
        type: Object,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
});

module.exports = mongoose.model('eventsub', eventsubSchema);