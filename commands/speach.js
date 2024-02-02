const speach = require('../functions/speach')

const commandOptions = {
    name: 'Speach Chat',
    cmd: 's',
    func: 'speachChat',
    type: 'reserved',
    cooldown: 0,
    userLevelName: 'everyone',
    userLevel: 0,
    enabled: false,
    description: `Habla en el chat | Ejemplo: !s <mensaje> | Ejemplo: !s Hola como estas`,
    premium: false,
    premium_config: {
        auto_start: {
            enabled: false,
            games: []
        },
        auto_stop: {
            enabled: false,
            games: []
        }
    }
}

async function speachChat(tags, argument, channel) {
    let user = tags.username;
    let message = argument || undefined;

    if (message === undefined) return { error: 'No message provided.', reason: 'No se ha proporcionado ningún mensaje.', status: 400 };

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

    let msg = `${user} dice: ${message}`;

    //if (message.length > 100) return { error: 'Message too long.', reason: 'El mensaje es demasiado largo.', status: 400 };

    let response = await speach(tags.id, msg, channel);

    response.cooldown = commandOptions.cooldown;

    return response;
}

module.exports = speachChat