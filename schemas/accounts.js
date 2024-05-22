const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
    user_id: {type: String, default: null},
    user_login: {type: String, default: null},
    user_email: {type: String, default: null},
    channelID: {type: String, default: null},
    channelName: {type: String, default: null},
    user_type: {type: String, default: ''},
    user_token: { iv: String, content: String },
    user_refresh_token: { iv: String, content: String },
    createdAt: { type: Date, default: Date.now },
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;