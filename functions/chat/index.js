const { getTwitchHelixURL } = require('../../util/links');
const { getStreamerHeader } = require('../../util/headers');
const getUserID = require('../getuserid');

const setonlyEmotes = require('./setonlyemotes');
const getonlyEmotes = require('./getonlyemotes');
const getuserColor = require('./getusercolor');
const clearChat = require('./deletechat');
const deleteMessage = require('./deletemessage');

class CHAT {
    constructor() {
        this.channel = null;
        this.helixURL = null;
        this.streamerHeaders = null;
        this.modID = null;
        this.userID = null;
        this.streamerID = null;
        this.botHeaders = null;
    }

    async init(channel, modID) {
        this.channel = channel;
        this.helixURL = await getTwitchHelixURL();
        this.streamerHeaders = await getStreamerHeader(channel);
        this.modID = modID;
        this.userID = await getUserID(channel);
        this.botHeaders = await getStreamerHeader('domdimabot');
    }

    async setStreamerID(streamerID) {
        this.streamerID = streamerID;
    }

    setOnlyEmotes = setonlyEmotes;
    getOnlyEmotes = getonlyEmotes;
    getUserColor = getuserColor;
    clearChat = clearChat;
    deleteMessage = deleteMessage;

}

module.exports = new CHAT();