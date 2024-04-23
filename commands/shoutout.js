const { getClips, showClip, getUserID, getChannel, makeAnnouncement, makeShoutout, getUser } = require('../functions');
const { shoutouts } = require('../util/cooldowns');

let commandOptions = {
    name: 'shoutout',
    cmd: 'so',
    func: 'shoutout',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    enabled: true,
    description: 'Menciona a un usuario y si tienes activado lo de los clips mandara un clip al canal',
    clips: true
};

async function shoutout(channel, streamer, modID) {
    let soCD = shoutouts;
    let channelID = await getUserID(channel);
    let streamerID = await getUserID(streamer);
    if (!channelID || !streamerID) { console.log({ channelID, streamerID, where: 'shoutout', for: channel }); return { clip: null } };
    let streamerUserData = await getUser(streamerID);
    if (streamerUserData.error) { console.log({ streamerUserData, where: 'shoutout', for: channel }); return { clip: null } };
    let streamerChannel = await getChannel(streamerID);
    let clips = await getClips(streamerID);
    let clip = await showClip(channel, clips, streamerChannel, streamerUserData);

    console.log({ clip })

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

    return { soClip: clip, cooldown: true, cooldown: commandOptions.cooldown }
}

module.exports = shoutout;