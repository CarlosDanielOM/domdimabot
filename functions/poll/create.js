async function createPoll(options) {
    let choices = options.choices.map((choice) => {
        return {
            title: choice
        }
    });

    let bodyData = {
        broadcaster_id: this.userID,
        title: options.title,
        choices,
        duration: Number(options.duration)
    }

    let response = await fetch(`${this.helixURL}/polls`, {
        method: 'POST',
        headers: this.streamerHeaders,
        body: JSON.stringify(bodyData)
    })

    let data = await response.json();

    if (data.error) {
        console.log({ error: data.error, reason: data.message, status: data.status });
        return false;
    }

    data = data.data[0];

    let choicesData = data.choices.map((choice) => {
        return {
            title: choice.title,
            id: choice.id
        }
    });

    let pollData = {
        id: data.id,
        title: data.title,
        choices: choicesData,
        channel: this.channel
    };

    this.setPoll(this.channel, pollData);

    return { message: `Encuesta creada con éxito.` }
}

module.exports = createPoll;