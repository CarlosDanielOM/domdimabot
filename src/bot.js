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
            awynowo: {
                response: `Siempre dominante, nunca sumiso.`
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