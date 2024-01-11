async function endPoll(status, pollID) {
    let body = {
        broadcaster_id: this.userID,
        id: pollID,
        status
    }

    let message = null;

    let response = await fetch(`${this.helixURL}/polls`, {
        method: 'PATCH',
        headers: this.streamerHeaders,
        body: JSON.stringify(body)
    });

    let data = await response.json();

    if (data.error) return { error: data.error, message: data.message, status: data.status };

    if (status === 'TERMINATED') message = 'Encuesta terminada con éxito.';
    if (status === 'ARCHIVED') message = 'Encuesta cancelada con éxito.';

    return { message: message };
}

module.exports = endPoll;