async function getPoll(pollID = null) {
    let params = `?broadcaster_id=${this.userID}`;

    if (pollID !== null) {
        params += `&id=${pollID}`;
    }

    let response = await fetch(`${this.helixURL}/polls${params}`, {
        method: 'GET',
        headers: this.streamerHeaders
    });

    let poll = await response.json();

    if (poll.status === 401) return { error: poll.error, message: poll.message, status: poll.status };

    if (poll.data.length === 0 || poll.status === 404) return { error: 'No polls found', message: 'No polls found', status: 404 };

    let data = poll.data[0];

    let choices = data.choices.map((choice) => {
        return {
            title: choice.title,
            id: choice.id
        }
    });

    let pollData = {
        id: data.id,
        title: data.title,
        choices,
        channel: this.channel
    };

    this.setPoll(this.channel, pollData);

    return poll.data[0];

}

module.exports = getPoll;