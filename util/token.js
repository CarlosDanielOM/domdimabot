const axios = require('axios');

const streamerNames = require('./streamerNames.js');
const channelSchema = require('../schemas/channel.schema');
const { encrypt, decrypt } = require('./crypto');

async function refreshAllTokens() {
    try {
        const streamers = await streamerNames.getNames();

        streamers.forEach(async (streamer) => {
            let channel = await streamerNames.getStreamer(streamer);

            console.log('channel', channel);

            const { token, refresh_token } = await refreshToken(decrypt(channel.refresh_token));

            channel.token = token;
            channel.refresh_token = refresh_token;

            console.log('channel', channel);

            let doc = await channelSchema.findOneAndUpdate({ name: channel.name }, { twitch_user_token: channel.token, twitch_user_refresh_token: channel.refresh_token });

            console.log('doc', doc);


        });
    } catch (error) {
        console.error('Error on refreshAllTokens:', error);
        throw error;
    }
}

async function refreshToken(refreshToken) {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://id.twitch.tv/oauth2/token',
            params: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            },
            headers: {
                'Content-Type': 'www-form-urlencoded'
            }
        });

        let token = response.data.access_token;
        let refresh_token = response.data.refresh_token;

        token = encrypt(token);
        refresh_token = encrypt(refresh_token);

        return { token, refresh_token };
    } catch (error) {
        console.error('Error on refreshToken:', error);
        throw error;
    }
}

module.exports = {
    refreshAllTokens,
    refreshToken
}