const STREAMER = require('../class/streamers');
const channelSchema = require('../schemas/channel.schema');
const { encrypt, decrypt } = require('./crypto');

async function refreshAllTokens() {
    try {
        await STREAMER.updateStreamers();
        const streamers = await STREAMER.getStreamersNames();

        streamers.forEach(async (streamer) => {
            let channel = await STREAMER.getStreamer(streamer);

            const { token, refresh_token } = await refreshToken(decrypt(channel.refresh_token));

            channel.token = token;
            channel.refresh_token = refresh_token;

            let doc = await channelSchema.findOneAndUpdate({ name: channel.name }, { twitch_user_token: channel.token, twitch_user_refresh_token: channel.refresh_token });

        });
        await STREAMER.updateStreamers();
    } catch (error) {
        console.error('Error on refreshAllTokens:', error);
        throw error;
    }
}

async function refreshSingleToken(user) {

}

async function refreshToken(refreshToken, independent = false, user = null) {
    try {
        let params = new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        });
        let response = await fetch(`https://id.twitch.tv/oauth2/token?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'www-form-urlencoded'
            }
        });

        response = await response.json();

        let token = response.access_token;
        let refresh_token = response.refresh_token;

        tokenEncrypt = encrypt(token);
        refresh_tokenEncrypt = encrypt(refresh_token);

        if (independent) {
            let doc = await channelSchema.findOneAndUpdate({ name: user }, { twitch_user_token: tokenEncrypt, twitch_user_refresh_token: refresh_tokenEncrypt });
            return { token };
        }

        return { tokenEncrypt, refresh_tokenEncrypt };
    } catch (error) {
        console.error('Error on refreshToken:', error);
        throw error;
    }
}

module.exports = {
    refreshAllTokens,
    refreshToken
}