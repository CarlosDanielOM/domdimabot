async function end(status, prediID, winner = null) {
    let body = {
        broadcaster_id: this.userID,
        id: prediID,
        status
    }

    if (status === 'RESOLVED') {
        body.winning_outcome_id = winner.id;
    }

    let response = await fetch(`${this.helixURL}/predictions`, {
        method: 'PATCH',
        headers: this.streamerHeaders,
        body: JSON.stringify(body)
    });

    let data = await response.json();

    if (data.status === 401) return null;

    if (data.error) {
        return { error: data.error, reason: data.message, status: data.status };
    }

    if (data.data === undefined) return null;

    if (data.data.length === 0) return null;

    if (status !== 'LOCKED') this.deletePredi(this.channel);

    let resData = {
        message: `Ha ganado la opción ${winner.title}!`,
    }

    return resData;
}

module.exports = end;