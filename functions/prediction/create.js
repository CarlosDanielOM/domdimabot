const { getStreamerHeader } = require("../../util/headers");
const getUserID = require("../getuserid");

async function create(options) {
    let headers = await getStreamerHeader(this.channel);
    let userID = await getUserID(this.channel);

    let outcomes = options.votes.map((vote) => {
        return {
            title: vote
        }
    });

    let bodyData = {
        broadcaster_id: userID,
        title: options.title,
        outcomes,
        prediction_window: Number(options.duration)
    }

    let response = await fetch(`${this.helixURL}/predictions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData)
    })

    let data = await response.json();

    if (data.error) {
        console.log({ error: data.error, reason: data.message, status: data.status });
        return false;
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

    return true;

}

module.exports = create;