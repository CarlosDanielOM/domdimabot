async function end(status, prediID, winner = null) {
    let body = {
        broadcaster_id: this.userID,
        id: prediID,
        status
    }

    let resData = {
        error: false,
        message: null,
    }

    if (status === 'RESOLVED') {
        body.winning_outcome_id = winner.id;
        resData.message = `Ha ganado la opción ${winner.title}!`;
    } else if (status === 'CANCELED') {
        resData.message = 'Se ha cancelado la predicción.';
    } else {
        resData.message = 'Se ha cerrado la predicción.';
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

    if (data.data === undefined) return { error: true, reason: 'No hay ninguna predicción activa.' };

    if (data.data.length === 0) return { error: true, reason: 'No hay ninguna predicción activa.' };

    if (status !== 'LOCKED') this.deletePredi(this.channel);

    return resData;
}

module.exports = end;