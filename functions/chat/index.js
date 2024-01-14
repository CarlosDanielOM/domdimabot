const { getTwitchHelixURL } = require('../../util/links');
const { getStreamerHeader } = require('../../util/headers');
const getUserID = require('../getuserid');

const setonlyEmotes = require('./setonlyemotes');
const getonlyEmotes = require('./getonlyemotes');

class CHAT {
    constructor() {
        this.channel = null;
        this.helixURL = null;
        this.streamerHeaders = null;
        this.modID = null;
        this.userID = null;
    }

    async init(channel, modID) {
        this.channel = channel;
        this.helixURL = await getTwitchHelixURL();
        this.streamerHeaders = await getStreamerHeader(channel);
        this.modID = modID;
        this.userID = await getUserID(channel);
    }

    setOnlyEmotes = setonlyEmotes;
    getOnlyEmotes = getonlyEmotes;

}

module.exports = new CHAT();