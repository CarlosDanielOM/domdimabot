const STREAMER = require('../class/streamers');
const channelSchema = require('../schemas/channel.schema');
const appConfigSchema = require('../schemas/app_config');
const { encrypt, decrypt } = require('./crypto');
const CLIENT = require('./client');

async function refreshAllTokens() {
    await STREAMER.updateStreamers();
    const streamers = await STREAMER.getStreamersNames();

    const promises = streamers.map(async (streamer) => {
        try {
            let channel = await STREAMER.getStreamer(streamer);

            if (channel.refresh_token.iv == '' || channel.refresh_token.content == '') {
                console.log(`Error on refreshAllTokens: ${streamer} refresh_token is null`)
                return;
            } else {
                const { tokenEncrypt, refresh_tokenEncrypt } = await refreshToken(decrypt(channel.refresh_token));

                if (!tokenEncrypt || !refresh_tokenEncrypt) {
                    CLIENT.disconnectChannel(channel.name);
                    let nullToken = { iv: null, content: null };
                    let nullRefreshToken = { iv: null, content: null };
                    await channelSchema.findOneAndUpdate({ name: channel.name }, { actived: false, twitch_user_token: nullToken, twitch_user_refresh_token: nullRefreshToken });
                    return console.log('Error on refreshAllTokens: tokenEncrypt or refresh_tokenEncrypt is null')
                };

                channel.token = tokenEncrypt;
                channel.refresh_token = refresh_tokenEncrypt;

                await channelSchema.findOneAndUpdate({ name: channel.name }, { twitch_user_token: channel.token, twitch_user_refresh_token: channel.refresh_token });
            }
        } catch (error) {
            console.error(`Error processing ${streamer}:`, error);
        }
    });

    await Promise.all(promises);
    await STREAMER.updateStreamers();

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

        if (response.status === 400) {
            return {
                tokenEncrypt: null,
                refresh_tokenEncrypt: null
            }
        }

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

async function getNewAppToken() {
    try {
        let params = new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'client_credentials'
        });
        let response = await fetch(`https://id.twitch.tv/oauth2/token?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'www-form-urlencoded'
            }
        });

        response = await response.json();

        let token = response.access_token;

        tokenEncrypt = encrypt(token);

        let doc = await appConfigSchema.findOneAndUpdate({ name: 'domdimabot' }, { access_token: tokenEncrypt });

        return { tokenEncrypt };
    } catch (error) {
        console.error('Error on getNewAppToken:', error);
        throw error;
    }

}

async function getAppToken() {
    let data = await appConfigSchema.findOne({ name: 'domdimabot' });
    return decrypt(data.access_token);
}

module.exports = {
    refreshAllTokens,
    refreshToken,
    getNewAppToken,
    getAppToken
}