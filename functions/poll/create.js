const commandOptions = {
    name: 'Create Poll',
    cmd: 'poll',
    func: 'createPoll',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    enabled: true,
    description: 'Crea una encuesta con la siguiente sintaxis: !poll <titulo>;<opcion1>/<opcion2>;<tiempo en segundos> | Ejemplo: !poll ¿Ganara el streamer?;Si/No;60 | El tiempo maximo es de 5 minutos y minimo de 30 segundos | El titulo no puede ser mayor a 100 caracteres | Las opciones no pueden ser mayor a 100 caracteres | Minimo 2 opciones y maximo 5 opciones y deben ser separadas por /',
};

async function createPoll(options) {
    let choices = options.choices.map((choice) => {
        return {
            title: choice
        }
    });

    let bodyData = {
        broadcaster_id: this.userID,
        title: options.title,
        choices,
        duration: Number(options.duration)
    }

    let response = await fetch(`${this.helixURL}/polls`, {
        method: 'POST',
        headers: this.streamerHeaders,
        body: JSON.stringify(bodyData)
    })

    let data = await response.json();

    if (data.error) {
        return { error: data.error, reason: data.message, status: data.status };
    }

    data = data.data[0];

    let choicesData = data.choices.map((choice) => {
        return {
            title: choice.title,
            id: choice.id
        }
    });

    let pollData = {
        id: data.id,
        title: data.title,
        choices: choicesData,
        channel: this.channel
    };

    this.setPoll(this.channel, pollData);

    return { message: `Encuesta creada con éxito.`, cooldown: commandOptions.cooldown }
}

module.exports = createPoll;