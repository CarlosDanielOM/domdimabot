const moongoose = require('mongoose');
const schema = moongoose.Schema;

const channelSchema = new schema({
    name: String,
    email: String,
    type: String, // 'twitch' or 'youtube'
    premium: Boolean,
    premium_until: Date,
    actived: Boolean,
    twitch_user_id: String,
    twitch_user_token: { iv: String, content: String },
    twitch_user_refresh_token: { iv: String, content: String },
    twitch_user_token_id: String,
});

const Channel = moongoose.model('Channel', channelSchema);

module.exports = Channel;