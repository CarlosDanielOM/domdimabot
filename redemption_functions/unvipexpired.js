const vipSchema = require('../schemas/vip');
const CHANNEL = require('../functions/channel/index');
const STREAMER = require('../class/streamers');

const { getStreamerHeaderById } = require('../util/headers');

async function unVIPExpiredUser(client, eventData) {
    let { broadcaster_user_id, broadcaster_user_login } = eventData;

    let vipData = await vipSchema.find({ channelID: broadcaster_user_id, vip: true });

    if (!vipData) return;

    let streamerHeader = await getStreamerHeaderById(broadcaster_user_id);

    vipData.map(async (item) => {
        let expireDate = new Date(item.expireDate.year, item.expireDate.month, item.expireDate.day);
        let currentDate = new Date();

        if (currentDate > expireDate) {
            console.log('UnVIP user:', item);
            let json = await CHANNEL.removeVIP(broadcaster_user_id, streamerHeader, item.userID);
            if (json.error) {
                console.log({ json, where: 'unVIPExpiredUser', for: 'removeVIP', for: item.channel, user: item.username });
                return client.say(broadcaster_user_login, `${json.message}`);
            };
            if (json.status === 204) {
                await vipSchema.findOneAndUpdate({ _id: item._id, username: item.username }, { vip: false });
                return client.say(broadcaster_user_login, `@${item.username} tu VIP ha expirado!`);
            }
        }
    });

}

module.exports = unVIPExpiredUser;