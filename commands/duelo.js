async function duelo(client, channel, user, argument) {
    if (!argument) {
        return `@${user.username} debes retar a alguien a un duelo!`;
    }
    let random = Math.floor(Math.random() * 100);
    let winner;
    let loser;
    client.say(channel, `@${user.username} ha retado a ${argument} a un duelo!`);
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
    ]

    message += ` ${responses[Math.floor(Math.random() * responses.length)]}`;

    return message;
}

module.exports = duelo;