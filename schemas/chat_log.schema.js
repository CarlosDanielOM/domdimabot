const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = mongoose.Types;

const chatLogSchema = new Schema({
    channel: String,
    message: String,
    username: String,
    timestamp: Date
});

const ChatLog = mongoose.model('Chat_Log', chatLogSchema);

module.exports = ChatLog;