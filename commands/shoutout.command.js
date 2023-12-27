const { shoutout } = require('../functions/shoutout.function');


module.exports = {
    so: async (broadcaster, streamer, moderator, baseUrl) => {
        let broadcasterID = await axios({method: 'get', url: `${baseUrl}/users?login=${broadcaster}`, headers});
        let streamerID = await axios({method: 'get', url: `${baseUrl}/users?login=${streamer}`, headers});
        let moderatorID = await axios({method: 'get', url: `${baseUrl}/users?login=${moderator}`, headers});

        broadcasterID = broadcasterID.data.data[0].id;
        streamerID = streamerID.data.data[0].id;
        moderatorID = moderatorID.data.data[0].id;

        let streamerChannelData = await axios({method: 'get', url: `${baseUrl}/channels?broadcaster_id=${streamerID}`, headers});
        streamerChannelData = streamerChannelData.data.data[0];
        
        let shout = shoutout.send(broadcasterID, streamerID, moderatorID);
        
        if(shout) {
            return {
                sent: true,
                streamerData: {
                    name: streamerChannelData.username,
                    title: streamerChannelData.title,
                    game: streamerChannelData.game_name
                }
            }
        } else {
            return {
                sent: false,
                error: shout.error
            }
        }
        
    }
}