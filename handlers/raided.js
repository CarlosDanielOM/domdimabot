const shoutout = require('../functions/shoutout')
const announcement = require('../functions/announcement')
const textConvertor = require('./text')

const { getClips, showClip, getChannel, getUser } = require('../functions')


const modID = '698614112';

async function raid(client, eventData, eventsubData, clipEnabled = false) {
    if (eventsubData.minViewers > eventData.viewers) return;
    let channelID = eventData.to_broadcaster_user_id;
    let channelName = eventData.to_broadcaster_user_login;
    let raiderID = eventData.from_broadcaster_user_id;
    let raiderName = eventData.from_broadcaster_user_login;
    
    let message = await textConvertor(channelID, eventData, eventsubData.message);
    
    let anoun = await announcement(channelID, modID, message.message, 'purple');
    
    await shoutout(channelID, raiderID, modID);
    
    if(!clipEnabled) return;

    let raiderData = await getUser(raiderID);
    if (raiderData.error) {
        console.log({ raiderData, where: 'raid', for: channelID });
        return false;
    };

    let raiderChannelData = await getChannel(raiderID);
    if (raiderChannelData.error) {
        console.log({ raiderChannelData, where: 'raid', for: channelID });
        return false;
    };

    let clips = await getClips(raiderID);
    if (!clips) {
        console.log({ clips, where: 'raid', for: channelID });
        return client.say(channelName, `${raiderName} has no clips available.`)
    };

    let clip = await showClip(channelName, clips, raiderData, raiderChannelData);

    if (clip.error) {
        console.log({ clip, where: 'raid', for: channelID });
        return false;
    };
}

module.exports = raid;