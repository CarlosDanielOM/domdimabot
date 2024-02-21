const moongoose = require('mongoose');
const Schema = moongoose.Schema;

const triggerFileSchema = new Schema({
    name: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    fileUrl: { type: String, required: true },
    channel: { type: String, required: true },
    channelID: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    date: {
        day: { type: Number, default: () => new Date().getDate() },
        month: { type: Number, default: () => new Date().getMonth() + 1 },
        year: { type: Number, default: () => new Date().getFullYear() },
    }
});

module.exports = moongoose.model('TriggerFile', triggerFileSchema);