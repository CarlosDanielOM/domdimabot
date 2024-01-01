const axios = require('axios');

async function validateToken(token) {
    let headers = {
        Authorization: `Bearer ${token}`,
        'Client-Id': process.env.CLIENT_ID
    }

    let response = await axios.get('https://id.twitch.tv/oauth2/validate', { headers });

    return response.data;
}

module.exports = {
    validateToken
}