const db = require('./db');
const httpsServer = require('./server');
const eventsub = require('./eventsub');
const tmi = require('tmi.js');
const axios = require('axios');

const SumimetroSupremo = require('./schemas/sumimetro_supremo.schema');

const URI = 'https://api.twitch.tv/helix/';

const headers = {
    'Authorization': `Bearer ${process.env.UNIX_TOKEN}`,
    'Client-ID': process.env.ClientID,
    'Content-Type': 'application/json'
}

async function Bot() {
    require('dotenv').config();

const mongoose = require('mongoose');
const ChatLog = require('./schemas/chat_log.schema');
const Channel = require('./schemas/channel.schema');

const modID = '698614112';

const commandsRegex = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?$/);



let client;

let streamerHeader;

let channels = []

let Channels = await Channel.find({actived: true}, 'name').exec();

let pandaSent = false;

Channels.forEach(channel => {
    channels.push(`#${channel.name}`);
});


const options = {
    options: {
        debug: false,
    },
    identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.User_Token_Auth,
    },
    channels: channels,
};


client = new tmi.Client(options);


client.connect().catch(console.error);

let onlyEmotes = false;

let users = [];

let crushMSGSent = false;

client.on('connected', (address, port) => {
    console.log('bot connected');
});

let fcounter = 0;

let predisData = [];
let pollsData = [];

let sumisosSupremos = [];
let dominantesSupremos = [];


let soSent = [];

let sent = false;


client.on('raided', (channel, username, viewers) => {
    if(channel === '#d0jiart') return;
    let broadcasterID = '';
    let streamertoken = process.env.UNIX_TOKEN;
    switch(channel) {
        case '#cdom201':
            broadcasterID = '533538623';
            streamertoken = process.env.CDOM_TOKEN;
            break;
        case '#sleeples_panda':
            broadcasterID = '206973156';
            streamertoken = process.env.PANDA_TOKEN;
            break;
        case '#elkenozvt':
            broadcasterID = '810249317';
            streamertoken = process.env.KENOZ_TOKEN;
            break;
        case '#saorimafervt':
            streamertoken = process.env.SAORI_TOKEN;
            broadcasterID = '548726483';
            break;
        case '#marcvt_':
            broadcasterID = '787543986';
            streamertoken = process.env.MARC_TOKEN;
            break;
        case '#raccher2':
            broadcasterID = '128348267';
            streamertoken = process.env.RACCHER2_TOKEN;
            break;
    }
    let user = username || undefined;
    if(user === undefined) return client.say(channel, `Hubo un error al enviar el SO, el usario no existe`);
    axios({
        method: 'get',
        url: `${URI}users?login=${user}`,
        headers
    })
    .then((res) => {
        let data = res.data.data[0];
        let id = data.id;
        axios({
            method: 'get',
            url: `${URI}channels?broadcaster_id=${id}`,
            headers,
        })
        .then((res) => {
            let data = res.data.data[0];
            let game = data.game_name;
            let title = data.title;
            let message = `Vayan a apoyar a ${user} en https://twitch.tv/${user} ! Estaba jugando a ${game} y nos trajeron ${viewers} personitas!`;
            showClip(channel, id);
            if(soSent.includes(channel)) return makeAnnouncement(broadcasterID, message);
            axios({
                method: 'post',
                url: `${URI}chat/shoutouts?from_broadcaster_id=${broadcasterID}&to_broadcaster_id=${id}&moderator_id=${modID}`,
                headers,
            })
            .then((res) => {
                makeAnnouncement(broadcasterID, message)
                soSent.push(channel);
                
                setTimeout(() => {
                    soSent = soSent.filter(so => so !== channel);
                }, 1000 * 60 * 2);
                
            })
            .catch((error) => {
                console.log(error);
                let httpcode = 429;
                httpcode = Number(429);
                if(httpcode === 429) return client.say(channel, `Hubo un error al enviar el SO a ${user} automatico, Se necesita un cooldown de 2 minutos para cada SO automatico.`);
                client.say(channel, `Hubo un error al enviar el SO a ${user} automatico, por favor contacta al creador del bot para que lo arregle.`)
            });
        })
    })
    .catch((error) => {
        console.log(error);
    });
});

client.on('resub', (channel, username, months, message, userstate, methods) => {
    let tier = userstate['msg-param-sub-plan'];
    switch(tier) {
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
    switch(tier) {
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

client.on('redeem', (channel, username, rewardType, tags, message) => {

});

client.on('message', (channel, tags, message, self) => {
    if(self) return;

    let streamertoken = process.env.UNIX_TOKEN;

    let broadcasterID = '';
    let moderatorID = '';

    let isMod = false;
    let isFounder = false;
    let subType = '';
    let newChatter = false;
    let shoutoutId = undefined;
    if(channel === '#d0jiart' || channel === '#saorimafervt') {
        newChatter = false;
    }
    switch(channel) {
        case '#cdom201':
            broadcasterID = '533538623';
            streamertoken = process.env.CDOM_TOKEN;
            break;
        case '#sleeples_panda':
            broadcasterID = '206973156';
            streamertoken = process.env.PANDA_TOKEN;
            break;
        case '#elkenozvt':
            broadcasterID = '810249317';
            streamertoken = process.env.KENOZ_TOKEN;
            break;
        case '#saorimafervt':
            streamertoken = process.env.SAORI_TOKEN;
            broadcasterID = '548726483';
            break;
        case '#marcvt_':
            broadcasterID = '787543986';
            streamertoken = process.env.MARC_TOKEN;
            break;
        case '#raccher2':
            broadcasterID = '128348267';
            streamertoken = process.env.RACCHER2_TOKEN;
            break;
    }

    streamerHeader = {
        'Authorization': `Bearer ${streamertoken}`,
        'Client-ID': process.env.ClientID,
        'Content-Type': 'application/json'
    }

    if(tags.mod || tags.username === 'cdom201' || tags.username === `${channel.replace('#', '')}`) {
        isMod = true;
    }

    if(tags.subscriber) {
        subType = tags['badge-info-raw'].split('/')[0];
        if(subType === 'founder') {
            isFounder = true;
        }
    }
    
    const commands = {
        predi: {
            response: (argument) => {
                if(channel === '#d0jiart') return;
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                let opt = argument.split(';');
                let options = {
                    title: opt[0],
                    votes: opt[1].split('\/'),
                    duration: opt[2]
                }

                axios({
                    method: 'post',
                    url: `${URI}predictions`,
                    headers: {
                        'Authorization': `Bearer ${streamertoken}`,
                        'Client-ID': process.env.ClientID,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        broadcaster_id: broadcasterID,
                        title: options.title,
                        outcomes: [
                            {
                                title: options.votes[0]
                            },
                            {
                                title: options.votes[1]
                            },
                        ],
                        prediction_window: Number(options.duration)
                    }
                })
                .then((res) => {
                    let data = res.data.data[0];
                    let prediData = {
                        id: data.id,
                        title: data.title,
                        outcomes: [
                            {
                                title: data.outcomes[0].title,
                                id: data.outcomes[0].id
                            },
                            {
                                title: data.outcomes[1].title,
                                id: data.outcomes[1].id
                            }
                        ],
                        channel: channel
                    }
                    predisData.push(prediData);
                    client.say(channel, `La predicción ha sido creada!`);
                })
                .catch((error) => {
                    console.log(error);
                });
            }
        },
        cancelpredi: {
            response: (argument) => {
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                let predi = predisData.find(predi => predi.channel === channel);
                if(predi === undefined) return client.say(channel, `No hay ninguna predicción activa en este canal.`);
                axios({
                    method: 'patch',
                    url: `${URI}predictions`,
                    headers: {
                        'Authorization': `Bearer ${streamertoken}`,
                        'Client-ID': process.env.ClientID,
                        'Content-Type': 'application/json'
                    },
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
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                let predi = predisData.find(predi => predi.channel === channel);
                if(predi === undefined) return client.say(channel, `No hay ninguna predicción activa en este canal.`);
                let outcomeNumber = Number(argument);
                outcomeNumber = outcomeNumber - 1;
                let outcome = predi.outcomes[outcomeNumber];
                if(outcome === undefined) return client.say(channel, `No existe esa opción en la predicción.`);
                axios({
                    method: 'patch',
                    url: `${URI}predictions`,
                    headers: {
                        'Authorization': `Bearer ${streamertoken}`,
                        'Client-ID': process.env.ClientID,
                        'Content-Type': 'application/json'
                    },
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
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                let predi = predisData.find(predi => predi.channel === channel);
                if(predi === undefined) return client.say(channel, `No hay ninguna predicción activa en este canal.`);
                axios({
                    method: 'patch',
                    url: `${URI}predictions`,
                    headers: {
                        'Authorization': `Bearer ${streamertoken}`,
                        'Client-ID': process.env.ClientID,
                        'Content-Type': 'application/json'
                    },
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
            response : (argument) => {
                if(channel === '#d0jiart') return;
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                let opt = argument.split(';');
                let options = {
                    title: opt[0],
                    choices: [
                        {title: opt[1].split('\/')[0]},
                        {title: opt[1].split('\/')[1]}
                    ],
                    channel_points_voting_enabled: false,
                    bits_voting_enabled: false,
                    duration: Number(opt[2])
                }

                axios({
                    method: 'post',
                    url: `${URI}polls`,
                    headers: {
                        'Authorization': `Bearer ${streamertoken}`,
                        'Client-ID': process.env.ClientID,
                        'Content-Type': 'application/json'
                    },
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
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                let poll = pollsData.find(poll => poll.channel === channel);
                if(poll === undefined) return client.say(channel, `No hay ninguna encuesta activa en este canal.`);
                axios({
                    method: 'patch',
                    url: `${URI}polls`,
                    headers: {
                        'Authorization': `Bearer ${streamertoken}`,
                        'Client-ID': process.env.ClientID,
                        'Content-Type': 'application/json'
                    },
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
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                let poll = pollsData.find(poll => poll.channel === channel);
                if(poll === undefined) return client.say(channel, `No hay ninguna encuesta activa en este canal.`);
                axios({
                    method: 'patch',
                    url: `${URI}polls`,
                    headers: {
                        'Authorization': `Bearer ${streamertoken}`,
                        'Client-ID': process.env.ClientID,
                        'Content-Type': 'application/json'
                    },
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
        anuncio: {
            response: (argument) => {
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                let arguments = argument.split(';');
                let message = arguments[0];
                let color = arguments[1];
                makeAnnouncement(broadcasterID, message, color);
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
                if(size <=10) {
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
                if(user2 !== null) {
                    user = user1;
                    touser = user2.replace('@', '');
                    multiple = true;
                }

                if(touser.toLowerCase() === tags.username && !multiple) {
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
                if(channel === '#d0jiart') return;
                let isActive = false;
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                if(onlyEmotes) {
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
        so: {
            response: (argument) => {
                if(channel === '#d0jiart') return;
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                let user = argument || undefined;
                if(user === undefined) return client.say(channel, `Se te olvido poner el username`);
                axios({
                    method: 'get',
                    url: `${URI}users?login=${user}`,
                    headers
                })
                .then((res) => {
                    let data = res.data.data[0];
                    let id = data.id;
                    axios({
                        method: 'get',
                        url: `${URI}channels?broadcaster_id=${id}`,
                        headers,
                    })
                    .then((res) => {
                        let data = res.data.data[0];
                        let game = data.game_name;
                        let title = data.title;
                        let message = `Vayan a apoyar a ${user} en https://twitch.tv/${user} ! Estaba jugando a ${game}`;
                        
                        showClip(channel, id);
                        if(soSent.includes(channel)) return makeAnnouncement(broadcasterID, message);
                        
                        axios({
                            method: 'post',
                            url: `${URI}chat/shoutouts?from_broadcaster_id=${broadcasterID}&to_broadcaster_id=${id}&moderator_id=${modID}`,
                            headers,
                        })
                        .then((res) => {
                            makeAnnouncement(broadcasterID, message);
                            soSent.push(channel);
                            setTimeout(() => {
                                soSent = soSent.filter(so => so !== channel);
                            }, 1000 * 60 * 2);
                        })
                        .catch((error) => {
                            let data = error.data;
                            let httpcode = 429;
                            if(httpcode === 429) return client.say(channel, `Hubo un error al enviar el SO a ${user}, Se necesita un cooldown de 2 minutos para cada SO automatico o un cooldown de 60 minutos si es a la misma persona.`);
                            client.say(channel, `Hubo un error al enviar el SO a ${user}, por favor contacta al creador del bot para que lo arregle.`)
                        })
                    })
                })
                .catch((error) => {
                    console.log(error);
                });
            }
        },
        game: {
            response: (argument) => {
                if(channel === '#d0jiart') return;
                let game = argument || undefined;
                if(game === undefined || !isMod) {
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
                    if(!isMod) return;
                    axios({
                        method: 'get',
                        url: `${URI}games?name=${game}`,
                        headers
                    })
                    .then(res => {
                        let data = res.data.data[0];
                        if(data === undefined) {
                            axios({
                                method: 'get',
                                url: `${URI}search/categories?query=${game}`,
                                headers
                            })
                            .then(res => {
                                let data = res.data.data[0] || undefined;
                                if(data === undefined) return client.say(channel, `No se encontro el juego "${game}"`);
                                let id = data.id ;
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
                if(channel === '#d0jiart') return;
                let title = argument || undefined;
                if(title === undefined) {
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
                    if(!isMod) return;
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
                if(channel === '#d0jiart') return;
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
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
                if(size <= 10) {
                    client.say(channel, `A ${user} le caben ${size}cm de tula. Poquito porque ya comio.`)
                } else if(size > 18 && size <= 24) {
                    client.say(channel, `A ${user} le caben ${size}cm de tula. Ya se le esta antojando.`);
                } else if(size > 24) {
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
        promo: {
            response: (argument) => {
                if(channel === '#d0jiart') return;
                if(!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
                let user = argument || undefined;
                if(user === undefined) return client.say(channel, `Se te olvido poner el username`);
                axios({
                    method: 'get',
                    url: `${URI}users?login=${user}`,
                    headers
                })
                .then((res) => {
                    let data = res.data.data[0];
                    let id = data.id;
                    axios({
                        method: 'get',
                        url: `${URI}channels?broadcaster_id=${id}`,
                        headers,
                    })
                    .then((res) => {
                        let data = res.data.data[0];
                        let game = data.game_name;
                        let title = data.title;
                        let message = `Vayan a apoyar a ${user} en https://twitch.tv/${user} ! Estaba jugando a ${game}`;
                        client.say(channel, message);
                        showClip(channel, id);
                    })
                    .catch((error) => {
                        console.log(error);
                    }); 
                })
                .catch((error) => {
                    console.log(error);
                });
            }
        },
        s: {
            response: (argument) => {
                let user = tags.username;
                let message = argument || undefined;
                let streamer = channel.replace('#', '');

                let msg = `${user} dice: ${message}`;
                
                if(message === undefined) return client.say(channel, `Se te olvido poner el mensaje.`);


                
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
        },
        sumitest: {
            response: (argument) => {
                let user = argument || tags['display-name'];
                axios({
                    method: 'get',
                    url: `http://localhost:3000/sumimetro/CDOM201/${user}`
                })
                .then((res) => {
                    client.say(channel, res.data);
                })
                .catch((error) => {
                    console.log(error);
                });
            }
        },
        ruletarusa: {
            response: () => {
                if(( tags.username !== channel.replace('#', '') ) && !tags.mod ) {isMod = false;}
                if(isMod) return client.say(channel, `No puedes disparar te como un mod, no seas pendejo.`);
                let user = tags['display-name'];
                let probability = Math.floor(Math.random() * 120) + 1;
                if(probability % 3 === 0) {
                    client.say(channel, `La ruleta rusa ha sido disparada! ${user} ha muerto.`);
                    let user_id = tags['user-id'];
                    timeoutUser(broadcasterID, user_id, 180, 'la Ruleta Rusa');
                } else {
                    client.say(channel, `La ruleta rusa no ha sido disparada! ${user} ha sobrevivido.`);
                }
            }
        },
    }

    const [raw, command, argument] = message.match(commandsRegex) || [];

    const { response } = commands[command] || {};

    if(typeof response === 'function') {
        response(argument);
    } else if (typeof response === 'string') {
        client.say(channel, response);
    }

    if(users.includes(tags['display-name'])) {
        newChatter = false;
    }

    if(newChatter) {
        client.say(channel, `Bienvenido ${tags['display-name']}! Espero te la pases bien por aqui.`);
        addUser(tags['display-name']);
    }

    if(tags.username === 'meguvt' && channel === "#cdom201") {
        if(crushMSGSent) return;
        crushMSGSent = true;
        client.say(channel, `La crush de @iKela_ `)
        setTimeout(() => {crushMSGSent = false}, 1000 * 60 * 5);
    }

    if(message.toLowerCase().includes('panda') && !pandaSent && channel !== '#d0jiart') {
        client.say(channel, `Panda? Donde?`);
        pandaSent = true;
        setTimeout(() => {pandaSent = false}, 1000 * 30);
    }

    if(channel !== '#d0jiart') {
        ChatLog.create({
            channel: channel,
            message: message,
            username: tags['display-name'],
            timestamp: new Date()
        })
        .then((res) => {
        })
        .catch((error) => {
            console.log(error);
        });
    };
    
});

client.on('cheer', (channel, tags, message) => {
    //console.table(tags);
    if (channel === "#d0jiart") return;
    client.say(channel, `Gracias por los ${tags.bits} bits ${tags['display-name']}!`)
});

}

function addUser(user) {
    users.push(user);
}

function validateOAuth() {
    axios({
        method: 'get',
        url: "https://id.twitch.tv/oauth2/validate",
        headers: {
            'Authorization': `OAuth ${process.env.PANDA_TOKEN}`,
            'Client-ID': process.env.ClientID
        }
    })
    .then((res) => {
        console.log(res);
    })
    .catch((error) => {
        console.log(error);
    });
}

function showClip(streamer, user = undefined) {
    let channel = streamer;
    if(user === undefined) return client.say(channel, `Se te olvido poner el username`);
    axios({
        method: 'get',
        url: `${URI}clips?broadcaster_id=${user}`,
        headers
    })
    .then((res) => {
        let data = res.data.data;
        let random = Math.floor(Math.random() * data.length);
        let clip = data[random];
        let url = clip['embed_url'];
        let duration = clip['duration'];
        let thumbnail = clip['thumbnail_url'];
        axios({
            method: 'post',
            url: `https://domdimabot.com/clip/${channel.replace('#', '')}`,
            //url: `http://localhost:3000/clip/${channel.replace('#', '')}`,
            data: {
                duration,
                thumbnail
            }
        })
        .then((res) => {
            console.log('funciona')
        })
        .catch((error) => {
            console.log(error);
        });
    })
    .catch((error) => {
        console.log(error);
    });
}

function changeGamebyName(game) {}

function changeGamebyCategorie(game) {}

function makeAnnouncement(streamer, message, color = 'purple') {
    axios({
        method: 'post',
        url: `${URI}chat/announcements?broadcaster_id=${streamer}&moderator_id=${modID}`,
        headers,
        data: {
            message,
            color
        }
    })
    .then((res) => {
        console.log(res);
    })
    .catch((error) => {
        console.log(error);
    });
}

function sendDiscordLink() {
    client.say('#cdom201', `Unete al discord del canal! https://discord.cdom201.com`) 
}

function checkPoll() {
    axios({
        method: 'get',
        url: `${URI}polls?broadcaster_id=${broadcasterID}`,
        headers
    })
    .then()
    .catch((error) => {
        console.log(error);
    });
}

setInterval(() => {
    sendDiscordLink()
}, 1000 * 60 * 30);

function getUserIdbyName(user) {
    axios({
        method: 'get',
        url: `${URI}users?login=${user}`,
        headers
    })
    .then((res) => {
        let data = res.data.data[0];
        let id = data.id;
        return id;
    })
    .catch((error) => {
        console.log(error);
    });

}

function timeoutUser(broadcaster_id, user, duration, reason = null) {
    axios({
        method: 'post',
        url: `${URI}moderation/bans?broadcaster_id=${broadcaster_id}&moderator_id=${modID}`,
        headers,
        data: {
            data: {
                user_id: user,
                duration,
                reason
            }
        }
    })
    .then((res) => {
        console.log(res);
    })
    .catch((error) => {
        console.log(error);
    });
}

//? ----------------- SUMIMETRO ----------------- ?//

function addDominanteSupremo(channel, user, percentage) {
    let dominanteSupremo = {
        channel,
        user,
        percentage
    }
    dominantesSupremos.push(dominanteSupremo);

}

function addSumisoSupremo(channel, user, percentage) {
    let sumisoSupremo = {
        channel,
        user,
        percentage
    }
    sumisosSupremos.push(sumisoSupremo);
}

function getUserSupremo(channel, type) {
    let supremo = null;
    if(type === 'dominante') {
        supremo = dominantesSupremos.find(supremo => supremo.channel === channel) || null;
    } else if (type === 'sumiso') {
        supremo = sumisosSupremos.find(supremo => supremo.channel === channel) || null;
    }
    return supremo;
}

function updateUserSupremo(channel, newUser, newPercentage, type) {
    let supremo = null;
    if(type === 'dominante') {
        supremo = dominantesSupremos.find(supremo => supremo.channel === channel) || null;
    } else if (type === 'sumiso') {
        supremo = sumisosSupremos.find(supremo => supremo.channel === channel) || null;
    }
    supremo.user = newUser;
    supremo.percentage = newPercentage;
}

function resetSupremeUsers() {
    dominantesSupremos = [];
    sumisosSupremos = [];
}

function getTodayDate() {
    let today = new Date();
    let day = today.getDate();
    let month = today.getMonth();
    let year = today.getFullYear();
    let hour = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();

    return {day, month, year, hour, minutes, seconds};
}

function getTargetDate() {
    let today = getTodayDate();

    today.day = today.day + 1;

    //? 31 days months
    if(today.day === 31 && today.month === (0, 2, 4, 6, 7, 9, 11)) {
        today.day = 1;
        today.month = today.month + 1;
        if(today.month >= 12) {
            today.month = 1;
            today.year = today.year + 1;
        }
    }

    //? 28 days month
    if(today.day === 28 && today.month === 1 && (today.year % 4) !== 0) {
        today.day = 1;
        today.month = 2;
    }

    //? 30 days months
    if(today.day === 30 && today.month === (3, 5, 8, 10)) {
        today.day = 1;
        today.month = today.month + 1;
    }

    //? Leap year
    if(today.day === 29 && today.month === 1 && (today.year % 4) === 0) {
        today.day = 1;
        today.month = 2;
    }
    
    
    let targetDate = new Date(today.year, today.month, today.day, 0, 1, 0);
    return targetDate;

}

//? Resets Supremos at 00:01:00
function repeatTimeout() {
    let targetDate = getTargetDate();
    let targetTime = targetDate - Date.now();
    setTimeout(() => {
        console.log('Resseting Supremos');
        resetSupremeUsers();
        repeatTimeout();
    }, targetTime);
}

setTimeout(() => {
    console.log('Resseting Supremos');
    repeatTimeout();
}, getTargetDate() - Date.now());

db.init();
httpsServer.init();
eventsub.init();

Bot();