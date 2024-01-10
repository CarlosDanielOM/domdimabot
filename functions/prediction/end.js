async function end(status, prediID, winner = null) {
    body = {
        broadcaster_id: this.userID,
        id: prediID,
        status
    }

    if (status === 'RESOLVED') {
        body.winning_outcome_id = winner;
    }

    let response = await fetch(`${this.helixURL}/predictions`, {
        method: 'PATCH',
        headers: this.streamerHeaders,
        body: JSON.stringify(body)
    });

    let data = await response.json();

    if (data.status === 401) return null;

    if (data.error) {
        console.log({ error: data.error, message: data.message, status: data.status });
        return null;
    }

    if (data.data === undefined) return null;

    if (data.data.length === 0) return null;

    if (status !== 'LOCKED') this.deletePredi(this.channel);
    return data.data[0];
}

module.exports = end;