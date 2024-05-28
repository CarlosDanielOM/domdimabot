const channelSchema = require('../schemas/channel.schema');
const { decrypt } = require('../util/crypto');

class STREAMERS {
    constructor() {
        this.streamerData = new Map();
    }

    async init() {
        try {
            await this.getStreamersFromDB();
            console.log('Streamers initialized successfully.');
        } catch (error) {
            console.error('Error initializing streamers:', error);
        }
    };

    async getStreamersFromDB() {
        try {
            const result = await channelSchema.find({ actived: true }, 'name twitch_user_id twitch_user_token twitch_user_refresh_token actived premium premium_plus refreshedAt');

            result.map((item) => {
                let data = {
                    name: item.name,
                    user_id: item.twitch_user_id,
                    token: item.twitch_user_token,
                    refresh_token: item.twitch_user_refresh_token,
                    active: item.actived,
                    premium: item.premium,
                    premium_plus: item.premium_plus,
                    refreshedAt: item.refreshedAt,
                }
                this.streamerData.set(data.name, data);
            });
        } catch (error) {
            console.error('Error on getStreamersFromDB:', error)
            throw error;
        }
    }

    async getStreamers() {
        return this.streamerData;
    }

    async getStreamer(name) {
        return await this.streamerData.get(name);
    }

    async getStreamerById(id) {
        let streamer = null;
        this.streamerData.forEach((data) => {
            if (data.user_id === id) {
                streamer = data;
            }
        });
        return streamer;
    }

    async setStreamer(name, data) {
        this.streamerData.set(name, data);
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

    async getStreamerTokenById(id) {
        let data = await this.getStreamerById(id);
        return decrypt({ content: data.token.content, iv: data.token.iv }).toString();
    }

    async getStreamerRefreshToken(name) {
        let data = await this.getStreamer(name);
        return decrypt({ content: data.refresh_token.content, iv: data.refresh_token.iv }).toString();
    }
}

module.exports = new STREAMERS();