function getTwitchHelixURL() {
    return "https://api.twitch.tv/helix";
}

function getTwitchOAuthURL() {
    return "https://id.twitch.tv/oauth2";
}

function getSpotifyURL() {
    return "https://api.spotify.com/v1"
}

function getSpotifyAuthURL() {
    return "https://accounts.spotify.com/api"
}

module.exports = {
    getTwitchHelixURL,
    getTwitchOAuthURL,
    getSpotifyURL,
    getSpotifyAuthURL
};