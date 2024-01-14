const POLL = require('../functions/poll');

async function poll(action, channel, argument, isMod) {
    await POLL.init(channel);
    let pollData = null;
    let PollID = null;

    let res = null;

    if (!isMod) return { error: 'Unauthorized', reason: 'No tienes permisos para usar este comando', status: 401 };

    if (!action) return { error: 'No action', reason: 'No se ha especificado ninguna acción', status: 400 };

    if (action !== 'CREATE') {
        let exists = POLL.hasPoll(channel);
        if (!exists) {
            await POLL.getTwitchPoll();
            exists = POLL.hasPoll(channel);
            if (!exists) return { error: 'No poll found', reason: 'No se ha encontrado ninguna encuesta', status: 404 };
        }

        pollData = POLL.getPoll(channel);
        PollID = pollData.id;

        res = POLL.endPoll(action, PollID);
    } else {
        let opt = argument.split(';');
        let options = {
            title: opt[0],
            choices: opt[1].split('\/'),
            duration: Number(opt[2])
        }

        res = POLL.createPoll(options);
    }

    return res;

}

module.exports = poll;