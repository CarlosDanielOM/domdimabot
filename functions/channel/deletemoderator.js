async function deleteModerator(userID) {
    let response = await fetch(`${this.helixURL}/moderation/moderators?broadcaster_id=${this.userID}&user_id=${userID}`, {
        method: 'DELETE',
        headers: this.streamerHeaders
    })

    if (response.status === 204) return { error: false, status: 204 };

    let json = await response.json();

    if (json.error) return json;

}

module.exports = deleteModerator;