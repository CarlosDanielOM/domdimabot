const { shoutout } = require('../commands/index');
const textConvertor = require('./text')

const modID = '698614112';

async function raid(client, eventData, eventsubData) {
    if (eventsubData.minViewers > eventData.viewers) return;
    let { soClip } = await shoutout(eventData.to_broadcaster_user_login, eventData.from_broadcaster_user_login, modID);
    if(!soClip) return client.say(eventData.from_broadcaster_user_login, "Error al reproducir el clip");
    
    let message = await textConvertor(eventData.to_broadcaster_user_id, eventData, eventsubData.message);

    client.say(eventData.to_broadcaster_user_login, message.message);
    
}

module.exports = raid;