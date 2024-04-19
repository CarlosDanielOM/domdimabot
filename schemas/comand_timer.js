const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commandTimerSchema = new Schema({
    command: { type: String, required: true },
    timer: { type: Number, required: true },
    channel: { type: String, required: true },
    channelID: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    date: {
        day: { type: Number, default: () => new Date().getDate() },
        month: { type: Number, default: () => new Date().getMonth() + 1 },
        year: { type: Number, default: () => new Date().getFullYear() },
    }
})

module.exports = mongoose.model('timer_command', commandTimerSchema)