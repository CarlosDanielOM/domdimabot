const SUMIMETRO = require('../class/sumimetro');

let instances = new Map();

async function sumimetro(channel, user, toUser) {
    //? GET RANDOM NUMBER
    let rand = Math.floor(Math.random() * 100) + 1;
    let dominante = rand;
    let sumiso = 100 - rand;

    let message = null;

    //? GET INSTANCE
    if (!instances.has(channel)) {
        instances.set(channel, new SUMIMETRO());
    }
    let instance = instances.get(channel);
    instance.init(channel);

    //? Checks if the command is for the user or for another user
    if (user === toUser) {
        //? Checks if the user has already given his sumimetro and if not, it saves it
        if (!instance.hasSumimetro(user)) {
            instance.sumimetro.set(user, {
                dominante: dominante,
                sumiso: sumiso
            });

            message = `Los lectores del sumimetro reflejan que ${user} tiene ${sumiso}% de sumiso y ${dominante}% de dominante.`;

        } else {
            //? If the user has already given his sumimetro, it returns the values
            let sumimetro = instance.getUserSumimetro(user);
            dominante = sumimetro.dominante;
            sumiso = sumimetro.sumiso;

            message = `El usuario ${user} el dia de hoy salio: ${dominante}% de dominante y ${sumiso}% de sumiso.`;

        }
    } else {
        //? Checks if the user has already given his sumimetro and if not, it says that the user has not given his sumimetro
        if (!instance.hasSumimetro(toUser)) {
            message = `El usuario ${toUser} no se ha dado su lectura de sumimetro.`
        } else {
            //? If the user has already given his sumimetro, it returns the values
            let sumimetro = instance.getUserSumimetro(toUser);
            dominante = sumimetro.dominante;
            sumiso = sumimetro.sumiso;

            message = `El usuario ${toUser} el dia de hoy salio: ${dominante}% de dominante y ${sumiso}% de sumiso.`
        }
    }

    return { message: message };
}

module.exports = sumimetro;