const TIME = require('../../class/time')

const createcommand = require('./createcommand');
const deletecommand = require('./deletecommand');
const editcommand = require('./editcommand');
const getcommand = require('./getcommand');

class COMMAND {
    constructor() {
        this.type = "command";
        this.channel = null;
        this.name = null;
        this.description = '';
        this.enabled = true;
        this.cooldown = 15;
        this.userLevel = 0;
        this.userLevelName = 'everyone';
        this.function = null;
        this.createdAt = new Date();
        this.dateInString = TIME.getDateinString();
        this.permissionLevels = {
            0: 'everyone',
            1: 'tier 1',
            2: 'tier 2',
            3: 'tier 3',
            4: 'vip',
            5: 'moderator',
            6: 'editor',
            7: 'broadcaster'
        }
    }

    async init(channel) {
        this.channel = channel;
    }

    createCommand = createcommand;
    deleteCommand = deletecommand;
    editCommand = editcommand;
    getCommand = getcommand;
}

module.exports = COMMAND;