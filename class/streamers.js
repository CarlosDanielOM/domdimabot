const channelSchema = require('../schemas/channel.schema');
const { decrypt } = require('../util/crypto');

class STREAMERS {
    constructor() {
        this.streamerData = new Map();
    }

    async init() {
        await this.getStreamersFromDB();
    }

    async getStreamersFromDB() {
        try {
            const result = await channelSchema.find({ actived: true }, 'name twitch_user_id twitch_user_token twitch_user_refresh_token');

            const namesArray = result.map((item) => {
                let data = {
                    name: item.name,
                    user_id: item.twitch_user_id,
                    token: item.twitch_user_token,
                    refresh_token: item.twitch_user_refresh_token
                }
                this.streamerData.set(data.name, data);
                return data;
            });

            return namesArray;
        } catch (error) {
            console.error('Error on getStreamersFromDB:', error)
            throw error;
        }
    }

    async getStreamer(name) {
        return this.streamerData.get(name);
    }

    async getStreamersNames() {
        const allNames = Array.from(this.streamerData.keys());
        return allNames;
    }

    async updateStreamers() {
        await this.getStreamersFromDB();
    }

    async getStreamerToken(name) {
        let data = await this.getStreamer(name);
        return decrypt({ content: data.token.content, iv: data.token.iv }).toString();
    }

    async getStreamerRefreshToken(name) {
        let data = await this.getStreamer(name);
        return decrypt({ content: data.refresh_token.content, iv: data.refresh_token.iv }).toString();
    }
}

module.exports = new STREAMERS();