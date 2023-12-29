const channelSchema = require('../schemas/channel.schema');

//Define array with all names
let streamerNames = [];

//? Get all channels from DB
async function getNamesDB(){
    try {
        const result = await channelSchema.find({actived: true}, 'name twitch_user_id twitch_user_token');

        // console.log(result)
        const namesArray = result.map((item) => ({
            name: item.name, 
            user_id: item.twitch_user_id, 
            token: item.twitch_user_token
        }));

        return namesArray;
    } catch (error) {
        console.error('Error on getNamesDB:', error)
        throw error;
    }
};

async function getStreamer(name) {
    const filteredS = streamerNames.filter((streamer) => streamer.name === name);
    return await filteredS[0];
}

function getNames(){
    const allNames = streamerNames.map(streamer => streamer.name);
    return allNames;
}

async function updateNames(){
    streamerNames = await getNamesDB();
};

module.exports = {
    getNames,
    updateNames,
    getStreamer
}