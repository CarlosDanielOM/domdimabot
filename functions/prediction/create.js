async function create(options) {
    let outcomes = options.votes.map((vote) => {
        return {
            title: vote
        }
    });

    let bodyData = {
        broadcaster_id: this.userID,
        title: options.title,
        outcomes,
        prediction_window: Number(options.duration)
    }

    let response = await fetch(`${this.helixURL}/predictions`, {
        method: 'POST',
        headers: this.streamerHeaders,
        body: JSON.stringify(bodyData)
    })

    let data = await response.json();

    if (data.error) {
        return { error: data.error, reason: data.message, status: data.status };
    }

    data = data.data[0];

    let outcomesData = data.outcomes.map((outcome) => {
        return {
            title: outcome.title,
            id: outcome.id
        }
    });

    let prediData = {
        id: data.id,
        title: data.title,
        outcomes: outcomesData,
        channel: this.channel
    };

    this.setPredi(this.channel, prediData);

    let resData = {
        error: false,
        message: `Se ha creado una nueva predicción con exito!`
    }

    return resData;

}

module.exports = create;