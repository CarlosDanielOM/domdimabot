const { getClips, showClip, getUserID, getChannel } = require('../functions');

async function promo(channel, streamer) {
    let user = await getUserID(streamer);
    if (!user) return { clip: null };
    let clips = await getClips(user);
    if (!clips) return { clip: null };
    let clip = await showClip(channel, clips);

    if (clip.error) return { clip: null };

    let channelData = await getChannel(user);
    channelData = {
        name: channelData.broadcaster_name,
        login: channelData.broadcaster_login,
        game: channelData.game_name,
    }

    return { clip, user, channelData };
}

module.exports = promo;