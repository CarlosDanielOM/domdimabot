async function get(prediID = null) {
    let params = `?broadcaster_id=${this.userID}`;


    if (prediID !== null) {
        params += `&id=${prediID}`;
    }

    let response = await fetch(`${this.helixURL}/predictions${params}`, {
        method: 'GET',
        headers: this.streamerHeaders
    });

    let predi = await response.json();

    if (predi.status === 401) return null;

    if (predi.data.length === 0) return null;

    let data = predi.data[0];

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

    return predi.data[0];
}

module.exports = get;