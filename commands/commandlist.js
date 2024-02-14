const commandSchema = require('../schemas/command');

let commandOptions = {
    name: 'commandlist',
    cmd: 'commandlist',
    func: 'commandlist',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'everyone',
    userLevel: 0,
    enabled: true,
    description: 'Muestra la lista de comandos disponibles',
    premium: false,
    premium_config: {
        timeout_user: {
            enabled: false
        },
        timeout_mod: {
            enabled: false
        }
    }
};

async function getCommandListDB(channel, type = 'all') {
    let commands = await commandSchema.find({ channel: channel, enabled: true }, 'name type')

    if (!commands) return { error: true, reason: 'No se encontraron comandos', status: 404 }

    commands = commands.map(command => {
        if (command.type !== 'timer') return `!${command.name}`
    });

    let message = `Los comandos disponibles son: ${commands.join(', ')}`;

    return { error: false, commands: commands, message: message, status: 200, cooldown: commandOptions.cooldown }

}

module.exports = getCommandListDB