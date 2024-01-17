async function validateToken(token) {
    let headers = {
        Authorization: `Bearer ${token}`,
        'Client-Id': process.env.CLIENT_ID
    }

    let response = await fetch('https://id.twitch.tv/oauth2/validate', { method: 'get', headers });

    return response.data;
}

module.exports = {
    validateToken
}