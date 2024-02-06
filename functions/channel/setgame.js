const getUserID = require('../getuserid');

async function setGame(game, channel = null) {
    let { streamerHeaders, helixURL } = this;

    let userID = await getUserID(channel);

    let response = await fetch(`${helixURL}/games?name=${game}`, {
        method: 'get',
        headers: streamerHeaders
    });

    let data = await response.json();
    let gameData = data.data[0];

    if (gameData === undefined) {
        response = await fetch(`${helixURL}/search/categories?query=${game}`, {
            method: 'get',
            headers: streamerHeaders
        });
        data = await response.json();
        gameData = data.data[0] || undefined;

        if (!gameData) return { error: true, reason: `No se ha encontrado el juego "${game}"` };
    }

    let id = gameData.id;
    let name = gameData.name;

    response = await fetch(`${helixURL}/channels?broadcaster_id=${userID}`, {
        method: 'PATCH',
        headers: streamerHeaders,
        body: JSON.stringify({
            game_id: id
        })
    });

    let message = `A cambiado el juego a: ${name}`;

    switch (response.status) {
        case 204:
            return { game: name, message: message };
        case 400:
            return { error: true, reason: `El juego "${name}" no es válido.` };
        case 401:
            return { error: true, reason: `No tengo permisos para cambiar el juego.` };
        case 403:
            return { error: true, reason: `No tienes permisos para cambiar el juego.` };
        case 409:
            return { error: true, reason: `Se ha intentedo cambiar el juego muchas veces en muy poco tiempo` };
        default:
            return { error: true, reason: `Error desconocido.` };
    }

}

module.exports = setGame;