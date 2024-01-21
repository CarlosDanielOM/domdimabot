const { getClips, showClip, getUserID, getChannel, getUser } = require('../functions');

async function promo(channel, streamer) {
    let user = await getUserID(streamer);
    if (!user) return { clip: null };
    let channelUserData = await getUser(user);
    if (channelUserData.error) return { clip: null };
    let channelData = await getChannel(user);
    let clips = await getClips(user);
    if (!clips) return { clip: null };
    let clip = await showClip(channel, clips, channelData, channelUserData);

    if (clip.error) return { clip: null };

    channelData = {
        name: channelData.broadcaster_name,
        login: channelData.broadcaster_login,
        game: channelData.game_name,
    }

    return { clip, user, channelData };
}

module.exports = promo;