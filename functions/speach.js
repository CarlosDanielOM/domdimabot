async function speach(tags, argument, channel) {
    let user = tags.username;
    let message = argument || undefined;

    let emotesToReplace = [];

    if (tags.emotes) {
        for (let emote in tags.emotes) {
            let emoteData = tags.emotes[emote];
            for (let i = 0; i < emoteData.length; i++) {
                let locations = emoteData[i].split('-');
                let start = parseInt(locations[0]) - 3;
                let end = parseInt(locations[1]);
                let emoteName = message.substring(start, end - 2);
                emotesToReplace.push(emoteName);
            }
        }
        for (let i = 0; i < emotesToReplace.length; i++) {
            message = message.replace(emotesToReplace[i], '');
        }
    }

    if (message === undefined) return { error: 'No message provided.', reason: 'No se ha proporcionado ningún mensaje.', status: 400 };

    let msg = `${user} dice: ${message}`;

    //if (message.length > 100) return { error: 'Message too long.', reason: 'El mensaje es demasiado largo.', status: 400 };

    let response = await fetch(`https://domdimabot.com/speach/${channel}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ speach: msg, msgID: tags.id })
    });

    let data = await response.json();

    return { data, msg };
}

module.exports = speach;