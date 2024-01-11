async function speach(tags, argument, channel) {
    let user = tags.username;
    let message = argument || undefined;

    let msg = `${user} dice: ${message}`;

    if (message === undefined) return { error: 'No message provided.', reason: 'No se ha proporcionado ningún mensaje.', status: 400 };
    //if (message.length > 100) return { error: 'Message too long.', reason: 'El mensaje es demasiado largo.', status: 400 };

    let response = await fetch(`https://domdimabot.com/speach/${channel}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ speach: msg })
    });

    let data = await response.json();

    return { data, msg };
}

module.exports = speach;