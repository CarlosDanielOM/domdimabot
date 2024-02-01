const SUMIMETRO = require('../class/sumimetro');
const TIME = require('../class/time');

const SumimetroSchema = require('../schemas/sumimetro.schema');
const SumimetroSupremoSchema = require('../schemas/sumimetro_supremo.schema');

let instances = new Map();

async function sumimetro(channel, user, toUser) {
    //? GET RANDOM NUMBER
    let rand = Math.floor(Math.random() * 100) + 1;
    let dominante = rand;
    let sumiso = 100 - rand;

    const lowerCaseUser = user.toLowerCase();
    const lowerCaseToUser = toUser.toLowerCase();

    let message = null;
    let sumimetroData = null;
    let sumimetroSupremoData = null;

    const todayDate = TIME.getDateinString();

    //? GET INSTANCE
    if (!instances.has(channel)) {
        instances.set(channel, new SUMIMETRO());
    }
    let instance = instances.get(channel);
    await instance.init(channel);

    //? Checks if the date the data was saved is the same as today
    if (instance.getDateString() === null) {
        instance.setDateString(todayDate.dateinString);
    }

    if (instance.getDateString() !== todayDate.dateinString) {
        instance.reset();
        instance.setDateString(todayDate.dateinString);
    }

    //? Checks if the command is for the user or for another user
    if (lowerCaseUser === lowerCaseToUser) {
        if (!instance.hasSumimetro(lowerCaseUser)) {
            await instance.getSumimetroDB(user, todayDate.dateinString);
        }
        //? Checks if the user has already given his sumimetro and if not, it saves it
        if (!instance.hasSumimetro(lowerCaseUser)) {
            instance.setSumimetro(lowerCaseUser, {
                dominante: dominante,
                sumiso: sumiso
            });

            message = `Los lectores del sumimetro reflejan que ${user} tiene ${sumiso}% de sumiso y ${dominante}% de dominante.`;

            //? Saves the sumimetro in the database
            sumimetroData = {
                channel: channel,
                username: user,
                login: lowerCaseUser,
                dominant: dominante,
                submissive: sumiso,
                timestamp: new Date(),
                date: {
                    day: todayDate.day,
                    month: todayDate.month,
                    year: todayDate.year
                }
            }

            let sumiData = new SumimetroSchema(sumimetroData);
            await sumiData.save();

            //* Creating the sumimetro supremo

            //! Get data from the database in case in bot memory is lost
            if(!instance.hasDominanteSupremo()) {}
            if(!instance.hasSumisoSupremo()) {}
            
            
            //? Checks if we are doing sumiso or dominante first
            if (dominante > 50) {
                //? Checks if there is a dominante supremo
                if (!instance.hasDominanteSupremo()) {
                    instance.setDominanteSupremo(lowerCaseUser);

                    sumimetroSupremoData = {
                        channel: channel,
                        username: user,
                        login: lowerCaseUser,
                        type: 'dominante',
                        percent: dominante,
                        timestamp: new Date(),
                        date: {
                            day: todayDate.day,
                            month: todayDate.month,
                            year: todayDate.year

                        }
                    }

                    let sumiSupremoData = new SumimetroSupremoSchema(sumimetroSupremoData);

                    await sumiSupremoData.save();

                    //* SENDS HTTP REQUEST TO THE API

                    let sumimetroRes = await fetch(`https://domdimabot.com/sumimetro/dominante/${channel}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: user,
                            value: dominante
                        })
                    })
                } else {
                    let dominanteSupremo = instance.getDominanteSupremo();
                    //? Checks if the user is the new dominante supremo
                    if (dominante > dominanteSupremo.dominante) {
                        instance.setDominanteSupremo(lowerCaseUser);
                        //? Saves the new dominante supremo in the database
                        sumimetroSupremoData = {
                            channel: channel,
                            username: user,
                            login: lowerCaseUser,
                            type: 'dominante',
                            percent: dominante,
                            timestamp: new Date(),
                            date: {
                                day: todayDate.day,
                                month: todayDate.month,
                                year: todayDate.year

                            }
                        }

                        let sumiSupremoData = new SumimetroSupremoSchema(sumimetroSupremoData);

                        await sumiSupremoData.save();

                        //* SENDS HTTP REQUEST TO THE API
                        let sumimetroRes = await fetch(`https://domdimabot.com/sumimetro/dominante/${channel}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                username: user,
                                value: dominante
                            })
                        })
                    }
                }
            }
            else if (sumiso > 50) {
                //? Checks if there is a sumiso supremo
                if (!instance.hasSumisoSupremo()) {
                    instance.setSumisoSupremo(lowerCaseUser);

                    sumimetroSupremoData = {
                        channel: channel,
                        username: user,
                        type: 'sumiso',
                        percent: sumiso,
                        timestamp: new Date(),
                        date: {
                            day: todayDate.day,
                            month: todayDate.month,
                            year: todayDate.year

                        }
                    }

                    let sumiSupremoData = new SumimetroSupremoSchema(sumimetroSupremoData);

                    await sumiSupremoData.save();

                    //* SENDS HTTP REQUEST TO THE API

                    let sumimetroRes = await fetch(`https://domdimabot.com/sumimetro/sumiso/${channel}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: user,
                            value: sumiso
                        })
                    })
                } else {
                    let sumisoSupremo = instance.getSumisoSupremo();
                    //? Checks if the user is the new sumiso supremo
                    if (sumiso > sumisoSupremo.sumiso) {
                        instance.setSumisoSupremo(lowerCaseUser);
                        //? Saves the new sumiso supremo in the database
                        sumimetroSupremoData = {
                            channel: channel,
                            username: user,
                            type: 'sumiso',
                            percent: sumiso,
                            timestamp: new Date(),
                            date: {
                                day: todayDate.day,
                                month: todayDate.month,
                                year: todayDate.year

                            }
                        }

                        let sumiSupremoData = new SumimetroSupremoSchema(sumimetroSupremoData);

                        await sumiSupremoData.save();

                        //* SENDS HTTP REQUEST TO THE API
                        let sumimetroRes = await fetch(`https://domdimabot.com/sumimetro/sumiso/${channel}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                username: user,
                                value: sumiso
                            })
                        })
                    }
                }
            }
        } else {
            //? If the user has already given his sumimetro, it returns the values
            let sumimetro = instance.getUserSumimetro(lowerCaseUser);
            dominante = sumimetro.dominante;
            sumiso = sumimetro.sumiso;

            message = `El usuario ${user} el dia de hoy salio: ${sumiso}% de sumiso y ${dominante}% de dominante.`;

        }
    } else {
        if (!instance.hasSumimetro(lowerCaseToUser)) {
            await instance.getSumimetroDB(toUser, todayDate.dateinString);
        }
        //? Checks if the user has already given his sumimetro and if not, it says that the user has not given his sumimetro
        if (!instance.hasSumimetro(lowerCaseToUser)) {
            message = `El usuario ${toUser} no se ha dado su lectura de sumimetro el dia de hoy.`
        } else {
            //? If the user has already given his sumimetro, it returns the values
            let sumimetro = instance.getUserSumimetro(lowerCaseToUser);
            dominante = sumimetro.dominante;
            sumiso = sumimetro.sumiso;

            message = `El usuario ${toUser} el dia de hoy salio: ${sumiso}% de sumiso y ${dominante}% de dominante.`
        }
    }

    return { message: message };
}

async function resetSumimetro(channel) {
    if (!instances.has(channel)) return { error: true, reason: 'No hay sumimetro para resetear.' };
    let instance = instances.get(channel);
    instance.reset();
    return { message: 'Se ha reseteado el sumimetro.' };
}

module.exports = { sumimetro, resetSumimetro };