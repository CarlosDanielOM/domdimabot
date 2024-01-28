async function clearChat() {
    let response = await fetch(`${this.helixURL}/moderation/chat?broadcaster_id=${this.userID}&moderator_id=${this.modID}`, {
        method: 'DELETE',
        headers: this.streamerHeaders
    })

    if (response.status === 204) return { error: false, status: 204 };

    let json = await response.json();

    if (json.error) return json;

}

module.exports = clearChat;