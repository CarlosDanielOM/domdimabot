async function clearChat() {
    let response = await fetch(`${this.helixURL}/chat?broadcaster_id=${this.userID}&moderator_id=${this.modID}`, {
        method: 'DELETE',
        headers: this.streamerHeaders
    })

    let json = await response.json();

    if (json.error) return json;

    if (json.status === 204) return { error: false, status: 204 };
}

module.exports = clearChat;