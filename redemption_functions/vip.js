const CHANNEL = require('../functions/channel');
const { getStreamerHeader } = require('../util/headers');

async function vipRedemtionFun(eventData, rewardData) {
    const { broadcaster_user_id, broadcaster_user_login, user_id } = eventData;
    let headers = await getStreamerHeader(broadcaster_user_login);

    if (rewardData.title === 'VIP') {
        let result = await CHANNEL.setVIP(broadcaster_user_id, headers, user_id);
        if (result.error) return { error: true, reason: result.message };
        if (result.status !== 204) return { error: true, reason: 'Error setting VIP' };
        return { error: false, message: 'VIP set' };
    }

}

module.exports = vipRedemtionFun;