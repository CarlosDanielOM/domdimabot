async function setOnlyEmotes(bool) {
    let response = await fetch(`${this.helixURL}/chat/settings?broadcaster_id=${this.userID}&moderator_id=${this.userID}`, {
        method: 'PATCH',
        headers: this.streamerHeaders,
        body: JSON.stringify({
            emote_mode: bool
        })
    });

    let data = await response.json();
    data = data.data[0];

    return data;
}

module.exports = setOnlyEmotes;