const endCommandOptions = {
    name: 'End Poll',
    cmd: 'endpoll',
    func: 'endPoll',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    enabled: true,
    description: 'Termina la encuesta actual | Ejemplo: !endpoll | No necesita argumentos | Solo funciona si la encuesta esta activa',
};

const cancelCommandOptions = {
    name: 'Cancel Poll',
    cmd: 'cancelpoll',
    func: 'cancelPoll',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    enabled: true,
    description: 'Cancela la encuesta actual | Ejemplo: !cancelpoll | No necesita argumentos | Solo funciona si la encuesta esta activa',
}

async function endPoll(status, pollID) {
    let cmdCooldown;
    let body = {
        broadcaster_id: this.userID,
        id: pollID,
        status
    }

    let message = null;

    let response = await fetch(`${this.helixURL}/polls`, {
        method: 'PATCH',
        headers: this.streamerHeaders,
        body: JSON.stringify(body)
    });

    let data = await response.json();

    if (data.error) return { error: data.error, reason: data.message, status: data.status };

    if (status === 'TERMINATED') {
        cmdCooldown = endCommandOptions.cooldown;
        message = 'Encuesta terminada con éxito.'
    };
    if (status === 'ARCHIVED') {
        cmdCooldown = cancelCommandOptions.cooldown;
        message = 'Encuesta cancelada con éxito.'
    }

    return { message: message, cooldown: cmdCooldown };
}

module.exports = endPoll;