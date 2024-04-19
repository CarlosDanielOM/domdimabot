const mongoose = require('mongoose')
const Schema = mongoose.Schema

const vipSchema = new Schema({
    username: { type: String, required: true },
    userID: { type: String, required: true },
    channel: { type: String, required: true },
    channelID: { type: String, required: true },
    duration: { type: Number, required: true },
    vip: { type: Boolean, default: true },
    date: {
        day: { type: Number, default: () => new Date().getDate() },
        month: { type: Number, default: () => new Date().getMonth() },
        year: { type: Number, default: () => new Date().getFullYear() }
    },
    createdAt: { type: Date, default: Date.now },
    expireDate: {
        day: { type: Number, required: true },
        month: { type: Number, required: true },
        year: { type: Number, required: true }
    }
})

module.exports = mongoose.model('vip', vipSchema)