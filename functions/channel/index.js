const getUserID = require('../getuserid');
const { getTwitchHelixURL } = require('../../util/links');
const { getStreamerHeader } = require('../../util/headers');

const getGame = require('./getgame');
const setGame = require('./setgame');
const getTitle = require('./gettitle');
const setTitle = require('./settitle');
const setModerator = require('./setmoderator');
const deleteModerator = require('./deletemoderator');
const setVIP = require('./setvip');
const removeVIP = require('./removevip');

class CHANNEL {
    constructor() {
        this.channel = null;
        this.game = null;
        this.streamerHeaders = null;
        this.helixURL = null;
        this.userID = null;
    }

    async init(channel) {
        this.channel = channel;
        this.helixURL = await getTwitchHelixURL();
        this.streamerHeaders = await getStreamerHeader(channel);
        this.userID = await getUserID(channel);
    }

    getGame = getGame;
    setGame = setGame;
    getTitle = getTitle;
    setTitle = setTitle;
    setModerator = setModerator;
    deleteModerator = deleteModerator;
    setVIP = setVIP;
    removeVIP = removeVIP;

}

module.exports = new CHANNEL();