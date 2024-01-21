async function getUserColor() {
    let response = await fetch(`${this.helixURL}/chat/color?user_id=${this.streamerID}`, {
        method: 'GET',
        headers: this.botHeaders
    });

    let data = await response.json();
    if (data.error) return { error: data.error, reason: data.message, status: data.status }
    data = data.data[0];

    console.log({ data });

    return data.color;
}

module.exports = getUserColor;