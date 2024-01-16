const commandSchema = require('../schemas/command');

class COMMAND {
    commandName = null;
    commandDescription = null;
    commandUsage = null;
    commandCoolDown = 15;
    commandFunc = null;
    commandType = 'command';
    commandEnabled = true;
    commandChannel = null;
    commandUserLevel = 0;
    commandUserLevelName = 'everyone';
    commandPermissionLevels = {
        0: 'everyone',
        1: 'tier 1',
        2: 'tier 2',
        3: 'tier 3',
        4: 'vip',
        5: 'founder',
        6: 'moderator',
        7: 'editor',
        8: 'broadcaster'
    }
    commandCreatedAt = null;
    commandDate = {
        day: null,
        month: null,
        year: null
    }

    commandData = null;
    schema = null;

    constructor() {
        this.channel = null;
        this.argument = null;
        this.schema = commandSchema;
    }

    async init(channel, argument) {
        this.channel = channel;
        this.argument = argument;
    }

    //? CREATE METHODS
    async createCommand(data) {
        let exists = await this.commandExistsInDB(data.name);
        if (exists) return { error: 'Command already exists', reason: 'command already exists', created: false };
        let cmd = await this.saveCommandToDB(data);
        if (!cmd) return { error: 'Command could not be created', reason: 'command could not be created', created: false };
        return { error: false, message: null, created: true, command: cmd };
    }

    //? DATABASE METHODS

    async getCommandFromDB(name) {
        let command = await this.schema.findOne({ name: name, channel: this.channel });
        if (command === null) return { error: 'Command does not exist', reason: 'command does not exist', command: null };
        return command;
    }

    async getCommandFromDBasd(name) {
        let command = await this.schema.findOne({ name: name, channel: this.channel });
        if (command === null) return null;
        return { error: false, message: command.func, cd: command.cooldown, enabled: command.enabled, userLevel: command.userLevel };
    }

    async commandExistsInDB(name) {
        let command = await this.schema.findOne({ name: name, channel: this.channel });
        if (command === null) return false;
        return true;
    }

    async saveCommandToDB(commandData) {
        let command = new this.schema(commandData);
        let cmd = await command.save();
        if (cmd === null) return false;
        return true;
    }
}

module.exports = new COMMAND();