const endCommandOptions = {
    name: 'End Prediction',
    cmd: 'endpredi',
    func: 'endPrediction',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    enabled: true,
    description: 'Termina la prediccion actual y da el resultado ganador | Ejemplo: !endpredi <numero de opcion> | Ejemplo: !endpredi 1 | El numero de opcion debe ser el numero de la opcion ganadora',
};

const cancelCommandOptions = {
    name: 'Cancel Prediction',
    cmd: 'cancelpredi',
    func: 'cancelPrediction',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    enabled: true,
    description: 'Cancela la prediccion actual | Ejemplo: !cancelpredi | No necesita argumentos | Solo funciona si la prediccion esta activa o si esta bloqueada',
};

const lockCommandOptions = {
    name: 'Lock Prediction',
    cmd: 'lockpredi',
    func: 'lockPrediction',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    enabled: true,
    description: 'Bloquea la prediccion actual lo cual inhabilita que los usuarios puedan votar | Ejemplo: !lockpredi | No necesita argumentos | Solo funciona si la prediccion esta activa',
};

async function end(status, prediID, winner = null) {
    let cmdCooldown;
    let body = {
        broadcaster_id: this.userID,
        id: prediID,
        status
    }

    let resData = {
        error: false,
        message: null,
    }

    if (status === 'RESOLVED') {
        body.winning_outcome_id = winner.id;
        cmdCooldown = endCommandOptions.cooldown;
        resData.message = `Ha ganado la opción ${winner.title}!`;
    } else if (status === 'CANCELED') {
        resData.message = 'Se ha cancelado la predicción.';
        cmdCooldown = cancelCommandOptions.cooldown;
    } else {
        resData.message = 'Se ha cerrado la predicción.';
        cmdCooldown = lockCommandOptions.cooldown;
    }

    let response = await fetch(`${this.helixURL}/predictions`, {
        method: 'PATCH',
        headers: this.streamerHeaders,
        body: JSON.stringify(body)
    });

    let data = await response.json();

    if (data.status === 401) return null;

    if (data.error) {
        return { error: data.error, reason: data.message, status: data.status };
    }

    if (data.data === undefined) return { error: true, reason: 'No hay ninguna predicción activa.' };

    if (data.data.length === 0) return { error: true, reason: 'No hay ninguna predicción activa.' };

    if (status !== 'LOCKED') this.deletePredi(this.channel);

    resData.cooldown = cmdCooldown;

    return resData;
}

module.exports = end;