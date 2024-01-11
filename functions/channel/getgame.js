async function getCurrentGame() {
    let response = await fetch(`${this.helixURL}/channels?broadcaster_id=${this.userID}`, {
        method: 'GET',
        headers: this.streamerHeaders
    });

    let data = await response.json();

    if (data.error) return { error: data.error, reason: data.message, status: data.status };

    data = data.data[0];

    let game = data.game_name;

    return game;
}

module.exports = getCurrentGame;