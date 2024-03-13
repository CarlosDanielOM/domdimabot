let furrymeter = new Map();

let supremeFurry = 0;

let furryDay = new Date().getDay();

async function furrometro(channel, username, argument, userlevel) {
    if (furryDay != new Date().getDay()) {
        furrymeter = new Map();
        supremeFurry = 0;
        furryDay = new Date().getDay();
    }
    if (argument == 'reset' && userlevel >= 6) {
        furrymeter = new Map();
        supremeFurry = 0;
        return { error: false, message: `El furrometro ha sido reseteado por ${username}` };
    } else if (argument == 'reset' && userlevel < 6) {
        return { error: true, reason: 'No tienes permisos para resetear el furrometro' };
    }

    if (furrymeter.has(username.toLowerCase())) {
        let furryValue = furrymeter.get(username.toLowerCase());
        return { error: false, message: `El dia de hoy ${username} es ${furryValue}%` };
    }

    let rand = Math.floor(Math.random() * 100) + 1;

    if (rand > supremeFurry) {
        supremeFurry = rand;

        await fetch('https://api.domdimabot.com/overlays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                value: supremeFurry,
            }),
        });
    }

    furrymeter.set(username.toLowerCase(), rand);

    return { error: false, message: `${username} tiene un nivel de furro del ${rand}%` };

}

module.exports = furrometro;