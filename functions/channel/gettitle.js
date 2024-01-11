async function getTitle() {
    let response = await fetch(`${this.helixURL}/channels?broadcaster_id=${this.userID}`, {
        method: 'GET',
        headers: this.streamerHeaders
    });

    let data = await response.json();

    if (data.error) return { error: data.error, reason: data.message, status: data.status };

    data = data.data[0];

    let title = data.title;

    return title;
}

module.exports = getTitle;