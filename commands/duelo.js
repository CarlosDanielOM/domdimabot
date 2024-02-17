async function duelo(client, channel, user, argument) {
    if (!argument) {
        return { error: true, reason: 'Debes retar a alguien!' };
    }
    let random = Math.floor(Math.random() * 100);
    let winner;
    let loser;
    client.say(channel, `@${user} ha retado a ${argument} a un duelo!`);
    if (random % 2 == 0) {
        winner = user;
        loser = argument;
    } else {
        winner = argument;
        loser = user;
    }
    let responses = [
        `${loser} no pudo con los abrazos de ${winner} y ha perdido el duelo!`,
        `${loser} ha sido derrotado por ${winner}!`,
        `${winner} ha ganado el duelo! ${loser} ha sido derrotado!`,
        `${winner} user su ataque especial y ha derrotado a ${loser}!`,
        `${loser} tiró sumimetro para dominar a ${winner} pero le salió 100% sumiso y lo agarraron a latigazos!`
    ]

    let message = ` ${responses[Math.floor(Math.random() * responses.length)]}`;

    return { error: false, message: message };
}

module.exports = duelo;