const { getClips, showClip, getUserID, getChannel, makeAnnouncement, makeShoutout } = require('../functions');
const { shoutouts } = require('../util/cooldowns');

async function shoutout(channel, streamer, modID) {
    let soCD = shoutouts;
    let channelID = await getUserID(channel);
    let streamerID = await getUserID(streamer);
    if (!channelID || !streamerID) return { clip: null };
    let clips = await getClips(streamerID);
    let clip = await showClip(channel, clips);

    let streamerChannel = await getChannel(streamerID);
    streamerChannel = {
        name: streamerChannel.broadcaster_name,
        login: streamerChannel.broadcaster_login,
        game: streamerChannel.game_name,
    }

    let message = `Vayan a apoyar a ${streamerChannel.name} en https://twitch.tv/${streamerChannel.login} ! Estaba jugando a ${streamerChannel.game}`

    makeAnnouncement(channelID, modID, message);

    if (!soCD.hasCooldown(channel)) {
        soCD.setCooldown(channel, 120);
        makeShoutout(channelID, streamerID, modID);
        return { soClip: clip, cooldown: false }
    }

    return { soClip: clip, cooldown: true }
}

module.exports = shoutout;