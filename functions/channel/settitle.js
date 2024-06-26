const { getTwitchHelixURL } = require('../../util/links');
const { getStreamerHeader } = require('../../util/headers');
const streamers = require('../../class/streamers');

async function setTitle(channel, title) {
    const streamer = await streamers.getStreamer(channel);
    const headers = await getStreamerHeader(channel);

    let response = await fetch(`${getTwitchHelixURL()}/channels?broadcaster_id=${streamer.user_id}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
            title: title
        })
    });

    switch (response.status) {
        case 204:
            return title;
        case 400:
            return { error: 'Bad Request', reason: 'El titulo es demasiado largo', status: 400 };
        case 401:
            return { error: 'Unauthorized', reason: 'No estas autorizado para realizar esta accion', status: 401 };
        case 403:
            return { error: 'Forbidden', reason: 'No tienes permisos para realizar esta accion', status: 403 };
        case 404:
            return { error: 'Not Found', reason: 'No se ha encontrado el recurso solicitado', status: 404 };
        case 500:
            return { error: 'Internal Server Error', reason: 'Error interno del servidor', status: 500 };
        case 503:
            return { error: 'Service Unavailable', reason: 'Servicio no disponible', status: 503 };
        default:
            return { error: 'Unknown Error', reason: 'Error desconocido', status: 0 };
    }
}

module.exports = setTitle;