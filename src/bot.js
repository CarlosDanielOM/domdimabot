require('dotenv').config();
const { connectChannels } = require('../util/dev');

const CLIENT = require('../util/client');
const messages = require('../handlers/message');

let client = null;

async function init() {

    client = await CLIENT.getClient();

    let streamerHeader;

    let pandaSent = false;

    await connectChannels(CLIENT.connectChannels, client);

    let onlyEmotes = false;

    let predisData = [];
    let pollsData = [];

    client.on('resub', (channel, username, months, message, userstate, methods) => {
        let tier = userstate['msg-param-sub-plan'];
        switch (tier) {
            case 'Prime':
                tier = 'Prime';
                break;
            case '1000':
                tier = '1';
                break;
            case '2000':
                tier = '2';
                break;
            case '3000':
                tier = '3';
                break;
        }
        client.say(channel, `Gracias por la resub ${username}! de ${months} meses y de nivel ${tier}!`);
    });

    client.on('subscription', (channel, username, method, message, userstate) => {
        let tier = userstate['msg-param-sub-plan'];
        switch (tier) {
            case 'Prime':
                tier = 'Prime';
                break;
            case '1000':
                tier = '1';
                break;
            case '2000':
                tier = '2';
                break;
            case '3000':
                tier = '3';
                break;
        }

        client.say(channel, `Gracias por la sub ${username} de nivel ${tier}!`);
    })

    client.on('timeout', (channel, username, reason, duration, tags) => {
        let reasonMSG = reason || 'pelele.';
        client.say(channel, `Se fusilaron a ${username} por ${duration} segundos. Por ${reasonMSG}`);
    });

    client.on('message', async (channel, tags, message, self) => {
        if (self) return;

        messages(client, channel.replace('#', ''), tags, message);

        let broadcasterID = '';
        let isMod = false;
        let isFounder = false;
        let subType = '';

        if (tags.mod || tags.username === 'cdom201' || tags.username === `${channel.replace('#', '')}`) {
            isMod = true;
        }

        if (tags.subscriber) {
            subType = tags['badge-info-raw'].split('/')[0];
            if (subType === 'founder') {
                isFounder = true;
            }
        }

        const commands = {
            sumimetro: {
                response: (argument) => {
                    let user = argument || tags['display-name'];
                    let dominante = Math.floor(Math.random() * 100) + 1;
                    let sumiso = 100 - dominante;

                    client.say(channel, `Los lectores del sumimetro reflejan que ${user} tiene ${sumiso}% de sumiso y ${dominante}% de dominante`);
                }
            },
            memide: {
                response: (argument) => {
                    let user = argument || tags['display-name'];
                    let size = Math.floor(Math.random() * 28) + 3;
                    if (size <= 10) {
                        client.say(channel, `El tamaño de la tula de ${user} mide ${size}cm. Pero que chiquito JAJAJA!`);
                    } else if (size > 18 && size <= 24) {
                        client.say(channel, `El tamaño de la tula de ${user} mide ${size}cm. Fua pero mira que macizo.`);
                    } else if (size > 24) {
                        client.say(channel, `El tamaño de la tula de ${user} mide ${size}cm. Esa madre ya paga hasta impuestos.`);
                    } else {
                        client.say(channel, `El tamaño de la tula de ${user} mide ${size}cm. Algo promedio eh?`);
                    }
                }
            },
            awynowo: {
                response: `Siempre dominante, nunca sumiso.`
            },
            amor: {
                response: (argument) => {
                    let touser = argument || null;
                    let user = tags['display-name'];
                    if (touser === null) return client.say(channel, `Se te olvido poner a la persona a la que quieres medir el amor. No mas por eso te quedaras solter@ toda tu vida.`);
                    let viewers = touser.split(' ');
                    let user1 = viewers[0];
                    let user2 = viewers[1] || null;
                    let multiple = false;
                    if (user2 !== null) {
                        user = user1;
                        touser = user2.replace('@', '');
                        multiple = true;
                    }

                    if (touser.toLowerCase() === tags.username && !multiple) {
                        return client.say(channel, `No te puedes medir el amor a ti mismo. No seas tan solitario.`);
                    }
                    let love = Math.floor(Math.random() * 100) + 1;
                    client.say(channel, `El amor entre ${user} y ${touser} es de ${love}%`);
                }
            },
            id: {
                response: (argument) => {
                    return console.log(tags.id);
                }
            },
            emotesonly: {
                response: (argument) => {
                    if (channel === '#d0jiart') return;
                    let isActive = false;
                    if (!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                    if (onlyEmotes) {
                        isActive = false;
                        onlyEmotes = false;
                    } else {
                        isActive = true;
                        onlyEmotes = true;
                    }
                    axios({
                        method: 'patch',
                        url: `${URI}chat/settings?broadcaster_id=${broadcasterID}&moderator_id=698614112`,
                        headers,
                        data: {
                            "emote_mode": isActive
                        }
                    })
                        .then((res) => {
                            client.say(channel, `El modo solo emotes ha sido activado.`);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            },
            just: {
                response: () => {
                    if (channel === '#d0jiart') return;
                    if (!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                    let justchattingid = '509658';
                    axios({
                        method: 'patch',
                        url: `${URI}channels?broadcaster_id=${broadcasterID}`,
                        headers: streamerHeader,
                        data: {
                            game_id: justchattingid
                        }
                    })
                        .then((res) => {
                            client.say(channel, `${tags['display-name']} --> a cambiado a Just Chatting`);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            },
            mecabe: {
                response: (argument) => {
                    let user = argument || tags['display-name'];
                    let size = Math.floor(Math.random() * 28) + 3;
                    if (size <= 10) {
                        client.say(channel, `A ${user} le caben ${size}cm de tula. Poquito porque ya comio.`)
                    } else if (size > 18 && size <= 24) {
                        client.say(channel, `A ${user} le caben ${size}cm de tula. Ya se le esta antojando.`);
                    } else if (size > 24) {
                        client.say(channel, `A ${user} le caben ${size}cm de tula. Ya dasela que se muere de hambre.`);
                    } else {
                        client.say(channel, `A ${user} le caben ${size}cm de tula. Ya comio pero le cabe mas.`);
                    }
                }
            },
            ponerla: {
                response: (argument) => {
                    let user = argument || tags['display-name'];
                    let probability = Math.floor(Math.random() * 100) + 1;
                    client.say(channel, `La probabilidad de que ${user} la ponga esta noche es de ${probability}%`);
                }
            },
        }

        if (message.toLowerCase().includes('panda') && !pandaSent && channel !== '#d0jiart') {
            client.say(channel, `Panda? Donde?`);
            pandaSent = true;
            setTimeout(() => { pandaSent = false }, 1000 * 30);
        }
    });

    client.on('cheer', (channel, tags, message) => {
        //console.table(tags);
        if (channel === "#d0jiart") return;
        client.say(channel, `Gracias por los ${tags.bits} bits ${tags['display-name']}!`)
    });

}

module.exports = {
    init
}