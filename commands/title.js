const CHANNEL = require('../functions/channel');

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

    return data;
}

module.exports = title;