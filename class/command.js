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
    commandUserLevel = 1;
    commandUserLevelName = 'everyone';
    commandPermissionLevels = {
        1: 'everyone',
        2: 'tier 1',
        3: 'tier 2',
        4: 'tier 3',
        5: 'vip',
        6: 'founder',
        7: 'moderator',
        8: 'editor',
        9: 'admin',
        10: 'broadcaster'
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
    async createCommand(data, channelID) {
        let exists = await this.commandExistsInDB(data.name, channelID);
        if (exists) return { error: 'Command already exists', reason: 'command already exists', created: false };
        let cmd = await this.saveCommandToDB(data);
        if (!cmd) return { error: 'Command could not be created', reason: 'command could not be created', created: false };
        return { error: false, message: null, created: true, command: cmd };
    }

    //? DELETE METHODS
    async deleteCommandFromDB(command, channelID) {
        let deleted = await this.schema.deleteOne({ cmd: command.name, channelID: channelID });
        if (deleted.deletedCount === 0) return false;
        return true;
    }

    //? DATABASE METHODS

    async getCommandFromDB(name, channelID) {
        let command = await this.schema.findOne({ cmd: name, channelID: channelID });
        if (command === null) return { error: 'Command does not exist', reason: 'command does not exist', command: null };
        return { error: false, command };
    }

    async getCommandFromDBasd(name) {
        let command = await this.schema.findOne({ cmd: name, channel: this.channel });
        if (command === null) return null;
        return { error: false, message: command.func, cd: command.cooldown, enabled: command.enabled, userLevel: command.userLevel };
    }

    async getReservedCommandFromDB(cmd, channelID) {
        let command = await this.schema.findOne({ cmd: cmd, channelID: channelID });
        if (command === null) return { error: 'Command does not exist', reason: 'command does not exist', command: null };
        return { error: false, command };
    }

    async reservedCommandExistsInDB(cmd, channelID) {
        let command = await this.schema.findOne({ cmd: cmd, channelID: channelID });
        if (command === null) return false;
        return true;
    }

    async commandExistsInDB(name, channelID) {
        let command = await this.schema.findOne({ cmd: name, channelID: channelID });
        if (command === null) return false;
        return true;
    }

    async saveCommandToDB(commandData) {
        let command = new this.schema(commandData);
        let cmd = await command.save();
        if (cmd === null) return false;
        return cmd;
    }

    async updateCommandInDB(command, channelID) {
        let updated = await this.schema.updateOne({ cmd: command.cmd, channelID: channelID }, command);
        if (updated.nModified === 0) return { error: 'Command could not be updated', reason: 'command could not be updated', updated: false };
        return { error: false, message: null, updated: true, command: command };
    }

    async updateCountableCommandInDB(command, count, channelID) {
        let updated = await this.schema.updateOne({ cmd: command, channelID: channelID }, { count: count });
        if (updated.nModified === 0) return { error: 'Command could not be updated', reason: 'command could not be updated', updated: false };
        return { error: false, message: null, updated: true, command: command };
    }

    async updateCommandIfActive(command, enabled, channelID) {
        let updated = await this.schema.updateOne({ cmd: command, channelID: channelID }, { enabled: enabled });
        if (updated.nModified === 0) return { error: 'Command could not be updated', reason: 'command could not be updated', updated: false };
        return { error: false, message: null, updated: true, command: command };
    }
}

module.exports = new COMMAND();