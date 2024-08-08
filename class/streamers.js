const channelSchema = require('../schemas/channel.schema');
const {decrypt} = require('../util/crypto');

const {getClient} = require('../util/database/dragonflydb');

class STREAMERS {
    constructor() {
        this.cache = getClient();
    }

    async init() {
        this.cache = getClient();
        await this.getStreamersFromDB();
        console.log('Streamers loaded to cache')
    }

    async getStreamersFromDB() {
        try {
            this.cache = getClient();
            const result = await channelSchema.find({actived: true}, 'name twitch_user_id twitch_user_token twitch_user_refresh_token actived premium premium_plus refreshedAt');

            for(let i = 0; i < result.length; i++) {
                let data = {
                    name: result[i].name,
                    user_id: result[i].twitch_user_id,
                    token: decrypt(result[i].twitch_user_token),
                    refresh_token: decrypt(result[i].twitch_user_refresh_token),
                    actived: result[i].actived ? 'true' : 'false',
                    premium: result[i].premium ? 'true' : 'false',
                    premium_plus: result[i].premium_plus ? 'true' : 'false',
                }
                
                await this.cache.hset(`${result[i].name}:streamer:data`, data);
            }
            
        } catch (error) {
            console.error(`Error getting streamers from DB: ${error}`);
        }
    }

    async getStreamerFromDBByName(name) {
        try {
            this.cache = getClient();
            const streamer = await channelSchema.findOne({name: name}, 'name twitch_user_id twitch_user_token twitch_user_refresh_token actived premium premium_plus refreshedAt');

            if (streamer) {
                let data = {
                    name: streamer.name,
                    user_id: streamer.twitch_user_id,
                    token: decrypt(streamer.twitch_user_token),
                    refresh_token: decrypt(streamer.twitch_user_refresh_token),
                    actived: streamer.actived ? 'true' : 'false',
                    premium: streamer.premium ? 'true' : 'false',
                    premium_plus: streamer.premium_plus ? 'true' : 'false',
                }

                await this.cache.hset(`${streamer.name}:streamer:data`, data);
            }
        } catch (error) {
            console.error(`Error getting streamer ${name} from DB: ${error}`);
        }
    }

    async getStreamerFromDBById(id) {
        try {
            this.cache = getClient();
            const streamer = await channelSchema.findOne({twitch_user_id: id}, 'name twitch_user_id twitch_user_token twitch_user_refresh_token actived premium premium_plus refreshedAt');

            if (streamer) {
                let data = {
                    name: streamer.name,
                    user_id: streamer.twitch_user_id,
                    token: decrypt(streamer.twitch_user_token),
                    refresh_token: decrypt(streamer.twitch_user_refresh_token),
                    actived: streamer.actived ? 'true' : 'false',
                    premium: streamer.premium ? 'true' : 'false',
                    premium_plus: streamer.premium_plus ? 'true' : 'false',
                }
                

                await this.cache.hset(`${streamer.name}:streamer:data`, data);
            }
        } catch (error) {
            console.error(`Error getting streamer ${id} from DB: ${error}`);
        }
    }

    async getStreamers() {
        const keys = await this.cache.keys('*:streamer:data');
        let streamers = [];

        for (const key of keys) {
            streamers.push(await this.cache.hgetall(key));
        }

        return streamers;
    }

    getStreamerByName(name) {
        return this.cache.hgetall(`${name}:streamer:data`);
    }

    async getStreamerById(id) {
        let cache = getClient();
        
        const keys = await cache.keys('*:streamer:data');
        let streamer = null;
        console.log(keys);
        for (const key of keys) {
            const data = await cache.hgetall(key);
            if (data.user_id === id) {
                streamer = data;
                break;
            }
        }

        return streamer;
    }

    async setStreamer(streamer) {
        try {
            await this.cache.hset(`${streamer.name}:streamer:data`, streamer);
        } catch (error) {
            console.error(`Error setting streamer ${streamer.name}: ${error}`);
        }
    }

    async deleteStreamer(name) {
        try {
            await this.cache.del(`${name}:streamer:data`);
        } catch (error) {
            console.error(`Error deleting streamer ${name}: ${error}`);
        }
    }

    async getStreamerNames() {
        const keys = await this.cache.keys('*:streamer:data');
        let names = [];

        keys.forEach(key => {
            names.push(key.split(':')[0]);
        });

        return names;
    }
    
    async updateStreamers() {
        try {
            await this.getStreamersFromDB();
            console.log('Streamers updated');
        } catch (error) {
            console.error(`Error updating streamers: ${error}`);
        }
    }

    async updateStreamerByName(name) {
        try {
            await this.getStreamerFromDBByName(name);
            console.log(`Streamer ${name} updated`);
        } catch (error) {
            console.error(`Error updating streamer ${name}: ${error}`);
        }
    }

    async updateStreamerById(id) {
        try {
            await this.getStreamerFromDBById(id);
            console.log(`Streamer ${id} updated`);
        } catch (error) {
            console.error(`Error updating streamer ${id}: ${error}`);
        }
    }
    
    async getStreamerTokenByName(name) {
        const streamer = await this.getStreamerByName(name);
        return streamer.token;
    }

    async getStreamerTokenById(id) {
        const streamer = await this.getStreamerById(id);
        return streamer.token;
    }

    async getStreamerRefreshTokenByName(name) {
        const streamer = await this.getStreamerByName(name);
        return streamer.refresh_token;
    }

    async getStreamerRefreshTokenById(id) {
        const streamer = await this.getStreamerById(id);
        return streamer.refresh_token;
    }
    
}

module.exports = new STREAMERS();