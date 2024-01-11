const { prediction } = require('../functions');

async function predi(action, channel, argument = null) {
    await prediction.init(channel);

    let predictionData = null;
    let prediID = null;

    let res = null;

    if (action !== 'CREATE') {
        let exists = prediction.hasPredi(channel);
        if (!exists) {
            await prediction.getPrediction();
            exists = prediction.hasPredi(channel);
            if (!exists) return false;
        }

        predictionData = prediction.getPredi(channel);
        prediID = predictionData.id;
    }

    if (action === 'END') {
        let winner = null;
        let won = Number(argument);

        if (isNaN(won)) return false;

        if (won <= 0 || won > predictionData.outcomes.length) return false;

        won--;

        winner = predictionData.outcomes[won];

        res = prediction.endPrediction('RESOLVED', prediID, winner);
    } else if (action === 'CREATE') {
        let opt = argument.split(';');
        let options = {
            title: opt[0],
            votes: opt[1].split('\/'),
            duration: opt[2]
        }

        res = prediction.createPrediction(options);
    } else {
        res = prediction.endPrediction(action, prediID);
    }

    return res;
}

module.exports = predi;