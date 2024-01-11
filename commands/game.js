const CHANNEL = require('../functions/channel');

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

    let game = await CHANNEL.setGame(argument);
    if (game.error) return game;

    return game;
}

module.exports = game;