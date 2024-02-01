const CHANNEL = require('../functions/channel');

const commandOptions = {
    name: 'Change Title',
    cmd: 'title',
    func: 'setTitle',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    enabled: true,
    description: `Cambia el titulo actual | Ejemplo: !title <titulo> | Ejemplo: !title Hola como estas`,
};

async function title(channel, argument = null, isMod = false) {
    await CHANNEL.init(channel);

    if (!argument || !isMod) {
        let title = await CHANNEL.getTitle();
        if (title.error) return title;
        let message = `El titulo actual es ${title}`;

        let data = {
            name: title,
            message: message
        }
        return data;
    }

    let title = await CHANNEL.setTitle(argument);
    if (title.error) return title;
    let message = `A cambiado el titulo a: ${title}`;

    let data = {
        name: title,
        message: message
    }

    data.cooldown = commandOptions.cooldown;

    return data;
}

module.exports = title;