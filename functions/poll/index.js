const { getTwitchHelixURL } = require('../../util/links');
const { getStreamerHeader } = require('../../util/headers');
const getUserID = require('../getuserid');

const createPoll = require('./create')
const getTwitchPoll = require('./get')
const endPoll = require('./end')

class POLL {
    constructor() {
        this.polls = new Map();
        this.userID = null;
        this.streamerHeaders = null;
        this.helixURL = null;
        this.channel = null;
    }

    async init(channel) {
        this.channel = channel;
        this.helixURL = await getTwitchHelixURL();
        this.streamerHeaders = await getStreamerHeader(channel);
        this.userID = await getUserID(channel);
    }

    createPoll = createPoll;
    getTwitchPoll = getTwitchPoll;
    endPoll = endPoll;

    getPolls() {
        return this.polls;
    }

    getPoll(id) {
        return this.polls.get(id);
    }

    setPoll(id, poll) {
        this.polls.set(id, poll);
    }

    deletePoll(id) {
        this.polls.delete(id);
    }

    hasPoll(id) {
        return this.polls.has(id);
    }

}

module.exports = new POLL();