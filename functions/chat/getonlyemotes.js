async function getOnlyEmotes() {
    let params = `?broadcaster_id=${this.userID}`

    if (this.modID) {
        params += `&moderator_id=${this.modID}`
    }

    let response = await fetch(`${this.helixURL}/chat/settings${params}`, {
        method: 'GET',
        headers: this.streamerHeaders,
    });

    let data = await response.json();
    data = data.data[0];

    let resData = {
        error: false,
        message: null,
        status: data.emote_mode
    }

    return resData;
}

module.exports = getOnlyEmotes;