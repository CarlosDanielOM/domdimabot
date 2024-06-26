const CHANNEL = require('../functions/channel');
const STREAMERS = require('../class/streamers');
const commandsSchema = require('../schemas/command');

const commandOptions = {
    name: 'Change Game',
    cmd: 'game',
    func: 'setGame',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    enabled: true,
    description: `Cambia el juego actual | Ejemplo: !game <nombre del juego> | Ejemplo: !game Fortnite`,
};

async function game(channel, argument = null, userLevel = 0, cmd = 'game') {
    let streamer = await STREAMERS.getStreamer(channel);
    let commandInfo = await commandsSchema.findOne({ channelID: streamer.user_id, cmd: cmd });
    if (!argument || userLevel < commandInfo.userLevel) {
        let game = await CHANNEL.getGame(streamer.user_id);
        if (game.error) return game;
        let message = `El juego actual es ${game}`;

        let data = {
            name: game,
            message: message
        }
        return data;
    }


    let game = await CHANNEL.setGame(argument, streamer.user_id);
    if (game.error) return game;

    game.cooldown = commandOptions.cooldown;

    return game;
}

module.exports = game;