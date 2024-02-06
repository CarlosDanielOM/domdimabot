const CHANNEL = require('../functions/channel');

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

async function game(channel, argument = null, isMod = false) {
    await CHANNEL.init(channel);

    if (!argument || !isMod) {
        let game = await CHANNEL.getGame();
        if (game.error) return game;
        let message = `El juego actual es ${game}`;

        let data = {
            name: game,
            message: message
        }
        return data;
    }

    let game = await CHANNEL.setGame(argument, channel);
    if (game.error) return game;

    game.cooldown = commandOptions.cooldown;

    return game;
}

module.exports = game;