const axios = require('axios');

module.exports = {
    send: async (broadcaster_id, streamer_id, mod_id, url, headers) => {
        let shoutout = await axios({method: 'post', url, headers});

        if(shoutout) {
            return {
                status: true
            };
        } else {
            return {
                status: false,
                error: shoutout.error
            }
        }
        
    }
}