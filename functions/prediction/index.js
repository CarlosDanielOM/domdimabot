const { getTwitchHelixURL } = require('../../util/links')
const { getStreamerHeader } = require('../../util/headers');
const getUserID = require('../getuserid');

const getPrediction = require('./get');
const createPrediction = require('./create');
const endPrediction = require('./end');

class prediction {
    constructor() {
        this.channel;
        this.helixURL = getTwitchHelixURL();
        this.userID;
        this.streamerHeaders;
        this.predictions = new Map();
    }

    getPrediction = getPrediction;
    createPrediction = createPrediction;
    endPrediction = endPrediction;

    async init(channel) {
        this.channel = channel;
        this.streamerHeaders = await getStreamerHeader(channel);
        this.userID = await getUserID(channel);
    }

    getPredi(id) {
        return this.predictions.get(id);
    }

    setPredi(id, prediction) {
        this.predictions.set(id, prediction);
    }

    deletePredi(id) {
        this.predictions.delete(id);
    }

    hasPredi(id) {
        return this.predictions.has(id);
    }

    getAllPredis() {
        return this.predictions;
    }
}

module.exports = new prediction();