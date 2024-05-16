const shoutout = require('../functions/shoutout')
const announcement = require('../functions/announcement')
const textConvertor = require('./text')

const modID = '698614112';

async function raid(client, eventData, eventsubData) {
    if (eventsubData.minViewers > eventData.viewers) return;
    
    let message = await textConvertor(eventData.to_broadcaster_user_id, eventData, eventsubData.message);
    console.log({message});
    
    let anoun = await announcement(eventData.to_broadcaster_user_id, modID, message.message, 'purple');
    
    let { soClip } = await shoutout(eventData.from_broadcaster_user_login, eventData.to_broadcaster_user_login, modID);
    if(!soClip) return client.say(eventData.to_broadcaster_user_login, "Error al reproducir el clip");
}

module.exports = raid;