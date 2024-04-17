const vipSchema = require('../schemas/vipSchema');
const CHANNEL = require('../functions/channel/index');

const { getStreamerHeader } = require('../util/headers');

async function unVIPExpiredUser(client, eventData) {
    let { broadcaster_user_id, broadcaster_user_login } = eventData;
    let vipData = await vipSchema.find({ channelID: broadcaster_user_id, vip: true });

    if (!vipData) return;

    let streamerHeader = await getStreamerHeader(broadcaster_user_login);

    vipData.map(async (item) => {
        let expireDate = new Date(item.expireDate.year, item.expireDate.month, item.expireDate.day);
        let currentDate = new Date();

        if (currentDate > expireDate) {
            let json = await CHANNEL.removeVIP(broadcaster_user_id, streamerHeader, item.username);
            if (json.error) {
                console.log({ json, where: 'unVIPExpiredUser', for: 'removeVIP' });
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