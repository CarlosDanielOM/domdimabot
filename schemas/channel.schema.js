const moongoose = require('mongoose');
const schema = moongoose.Schema;

const channelSchema = new schema({
    name: String,
    type: String, // 'twitch' or 'youtube'
    premium: Boolean,
    premium_until: Date,
    actived: Boolean,
});

const Channel = moongoose.model('Channel', channelSchema);

module.exports = Channel;