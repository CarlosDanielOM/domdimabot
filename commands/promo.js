const { getClips, showClip, getUserID, getChannel, getUser } = require('../functions');

let commandOptions = {
    name: 'promo',
    cmd: 'promo',
    func: 'promo',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    enabled: true,
    description: 'Es otra forma de lanzar un shoutout pero sin activar el shoutout y la respuesta es por texto en vez de por anuncio para que los que esten en movil puedan ver el mensaje',
    clips: true
};

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

    return { clip, user, channelData, cooldown: commandOptions.cooldown };
}

module.exports = promo;