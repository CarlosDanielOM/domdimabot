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
            cancelpredi: {
                response: (argument) => {
                    if (!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                    let predi = predisData.find(predi => predi.channel === channel);
                    if (predi === undefined) return client.say(channel, `No hay ninguna predicción activa en este canal.`);
                    axios({
                        method: 'patch',
                        url: `${URI}predictions`,
                        headers: streamerHeader,
                        data: {
                            broadcaster_id: broadcasterID,
                            id: predi.id,
                            status: 'CANCELED'
                        }
                    })
                        .then((res) => {
                            predisData = predisData.filter(predi => predi.channel !== channel);
                            client.say(channel, `La predicción ha sido cancelada!`);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            },
            endpredi: {
                response: (argument) => {
                    if (!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                    let predi = predisData.find(predi => predi.channel === channel);
                    if (predi === undefined) return client.say(channel, `No hay ninguna predicción activa en este canal.`);
                    let outcomeNumber = Number(argument);
                    outcomeNumber = outcomeNumber - 1;
                    let outcome = predi.outcomes[outcomeNumber];
                    if (outcome === undefined) return client.say(channel, `No existe esa opción en la predicción.`);
                    axios({
                        method: 'patch',
                        url: `${URI}predictions`,
                        headers: streamerHeader,
                        data: {
                            broadcaster_id: broadcasterID,
                            id: predi.id,
                            status: 'RESOLVED',
                            winning_outcome_id: outcome.id
                        }
                    })
                        .then((res) => {
                            predisData = predisData.filter(predi => predi.channel !== channel);
                            client.say(channel, `Ha Ganado ${outcome.title}!`);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            },
            lockpredi: {
                response: (argument) => {
                    if (!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                    let predi = predisData.find(predi => predi.channel === channel);
                    if (predi === undefined) return client.say(channel, `No hay ninguna predicción activa en este canal.`);
                    axios({
                        method: 'patch',
                        url: `${URI}predictions`,
                        headers: streamerHeader,
                        data: {
                            broadcaster_id: broadcasterID,
                            id: predi.id,
                            status: 'LOCKED'
                        }
                    })
                        .then((res) => {
                            client.say(channel, `La predicción ha sido bloqueada! No se permiten mas votos.`);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            },
            poll: {
                response: (argument) => {
                    if (!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                    let opt = argument.split(';');
                    let options = {
                        title: opt[0],
                        choices: [
                            { title: opt[1].split('\/')[0] },
                            { title: opt[1].split('\/')[1] }
                        ],
                        channel_points_voting_enabled: false,
                        bits_voting_enabled: false,
                        duration: Number(opt[2])
                    }

                    axios({
                        method: 'post',
                        url: `${URI}polls`,
                        headers: streamerHeader,
                        data: {
                            broadcaster_id: broadcasterID,
                            title: options.title,
                            choices: options.choices,
                            duration: options.duration
                        }
                    })
                        .then((res) => {
                            let data = res.data.data[0];
                            let pollData = {
                                id: data.id,
                                title: data.title,
                                channel: channel
                            }
                            pollsData.push(pollData);
                            client.say(channel, `La encuesta ha sido creada!`);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            },
            endpoll: {
                response: (argument) => {
                    if (!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                    let poll = pollsData.find(poll => poll.channel === channel);
                    if (poll === undefined) return client.say(channel, `No hay ninguna encuesta activa en este canal.`);
                    axios({
                        method: 'patch',
                        url: `${URI}polls`,
                        headers: streamerHeader,
                        data: {
                            broadcaster_id: broadcasterID,
                            id: poll.id,
                            status: 'TERMINATED'
                        }
                    })
                        .then((res) => {
                            pollsData = pollsData.filter(poll => poll.channel !== channel);
                            client.say(channel, `La encuesta ha sido terminada!`);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            },
            cancelpoll: {
                response: (argument) => {
                    if (!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                    let poll = pollsData.find(poll => poll.channel === channel);
                    if (poll === undefined) return client.say(channel, `No hay ninguna encuesta activa en este canal.`);
                    axios({
                        method: 'patch',
                        url: `${URI}polls`,
                        headers: streamerHeader,
                        data: {
                            broadcaster_id: broadcasterID,
                            id: poll.id,
                            status: 'ARCHIVED'
                        }
                    })
                        .then((res) => {
                            pollsData = pollsData.filter(poll => poll.channel !== channel);
                            client.say(channel, `La encuesta ha sido cancelada!`);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            },
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
            game: {
                response: (argument) => {
                    if (channel === '#d0jiart') return;
                    let game = argument || undefined;
                    if (game === undefined || !isMod) {
                        axios({
                            method: 'get',
                            url: `${URI}channels?broadcaster_id=${broadcasterID}`,
                            headers
                        })
                            .then(res => {
                                let data = res.data.data[0];
                                let game = data.game_name;
                                client.say(channel, `${tags['display-name']} --> El juego actual es "${game}"`);
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    } else {
                        if (!isMod) return;
                        axios({
                            method: 'get',
                            url: `${URI}games?name=${game}`,
                            headers
                        })
                            .then(res => {
                                let data = res.data.data[0];
                                if (data === undefined) {
                                    axios({
                                        method: 'get',
                                        url: `${URI}search/categories?query=${game}`,
                                        headers
                                    })
                                        .then(res => {
                                            let data = res.data.data[0] || undefined;
                                            if (data === undefined) return client.say(channel, `No se encontro el juego "${game}"`);
                                            let id = data.id;
                                            let title = data['name'];
                                            axios({
                                                method: 'patch',
                                                url: `${URI}channels?broadcaster_id=${broadcasterID}`,
                                                headers: streamerHeader,
                                                data: {
                                                    game_id: id
                                                }
                                            })
                                                .then(res => {
                                                    client.say(channel, `${tags['display-name']} a cambiado el juego a, "${title}"`);
                                                })
                                                .catch(error => {
                                                    client.say(channel, `Hubo un error al cambiar el juego.`)
                                                    console.log(error);
                                                })
                                        })
                                        .catch(error => {
                                            console.log(error);
                                        });
                                } else {
                                    let id = data.id;
                                    let name = data.name;
                                    axios({
                                        method: 'patch',
                                        url: `${URI}channels?broadcaster_id=${broadcasterID}`,
                                        headers: streamerHeader,
                                        data: {
                                            game_id: id
                                        }
                                    })
                                        .then(res => {
                                            client.say(channel, `${tags['display-name']} ha cambiado el juego a, "${name}"`);
                                        })
                                        .catch(error => {
                                            client.say(channel, `Hubo un error al cambiar el juego.`)
                                            console.log(error);
                                        });
                                }
                            })
                    }

                }
            },
            title: {
                response: (argument) => {
                    if (channel === '#d0jiart') return;
                    let title = argument || undefined;
                    if (title === undefined) {
                        axios({
                            method: 'get',
                            url: `${URI}channels?broadcaster_id=${broadcasterID}`,
                            headers
                        })
                            .then(res => {
                                let data = res.data.data[0];
                                let title = data.title;
                                client.say(channel, `${tags['display-name']} --> El titulo actual es: "${title}"`);
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    } else {
                        if (!isMod) return;
                        axios({
                            method: 'patch',
                            url: `${URI}channels?broadcaster_id=${broadcasterID}`,
                            headers: streamerHeader,
                            data: {
                                title
                            }
                        })
                            .then(res => {
                                client.say(channel, `${tags['display-name']} ha cambiado el titulo a, "${title}"`);
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    }
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
            s: {
                response: (argument) => {
                    let user = tags.username;
                    let message = argument || undefined;
                    let streamer = channel.replace('#', '');

                    let msg = `${user} dice: ${message}`;

                    if (message === undefined) return client.say(channel, `Se te olvido poner el mensaje.`);



                    axios({
                        method: 'post',
                        url: `https://domdimabot.com/speach/${streamer}`,
                        data: {
                            speach: msg
                        }
                    })
                        .then((res) => {
                            console.log(res.data);
                        })
                        .catch((error) => {
                            console.log(error);
                        });

                }
            }
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