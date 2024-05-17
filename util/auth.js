require('dotenv').config();
const jwt = require('jsonwebtoken');

async function validateToken(token) {
    let headers = {
        Authorization: `Bearer ${token}`,
        'Client-Id': process.env.CLIENT_ID
    }

    let response = await fetch('https://id.twitch.tv/oauth2/validate', { method: 'get', headers });

    return response.data;
}

async function validateAuthToken(token) {

}

function generateToken(data) {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = {
    validateToken,
    validateAuthToken,
    generateToken
}