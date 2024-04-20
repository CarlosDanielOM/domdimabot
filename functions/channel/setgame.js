const getUserID = require('../getuserid');
const { getStreamerHeaderById } = require('../../util/headers');
const { getTwitchHelixURL } = require('../../util/links');

async function setGame(game, channelID = null) {
    let helixURL = getTwitchHelixURL();
    if (channelID === null) return { error: true, reason: `No se ha especificado el canal.` };

    let streamerHeaders = await getStreamerHeaderById(channelID);

    let response = await fetch(`${helixURL}/games?name=${game}`, {
        method: 'get',
        headers: streamerHeaders
    });

    let data = await response.json();
    let gameData = data.data[0] || undefined;

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

    response = await fetch(`${helixURL}/channels?broadcaster_id=${channelID}`, {
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