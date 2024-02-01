const { getUrl } = require('../util/dev');
const sumimetroSchema = require('../schemas/sumimetro.schema');

class SUMIMETRO {
    constructor() {
        this.sumimetro = new Map();
        this.sumisoSupremo = {};
        this.dominanteSupremo = {};

        this.sumiso = 0;
        this.dominante = 0;
        this.message = '';

        this.channel = null;
        this.url = null;

        this.date = null;
    }

    init(channel) {
        this.channel = channel;
        this.url = getUrl();
    }

    reset() {
        this.sumimetro = new Map();
        this.sumisoSupremo = {};
        this.dominanteSupremo = {};

        this.sumiso = 0;
        this.dominante = 0;
        this.message = '';

        this.date = null;
    }

    //? GET METHODS

    getSumimetros() {
        return this.sumimetro;
    }

    getUserSumimetro(user) {
        return this.sumimetro.get(user);
    }

    getSumiso() {
        return this.sumiso;
    }

    getDominante() {
        return this.dominante;
    }

    getMessage() {
        return this.message;
    }

    getSumisoSupremo() {
        return this.sumisoSupremo;
    }

    getDominanteSupremo() {
        return this.dominanteSupremo;
    }

    getDateString() {
        return this.date;
    }

    //? HAS METHODS
    hasSumimetro(user) {
        return this.sumimetro.has(user);
    }

    hasSumisoSupremo() {
        return Object.hasOwn(this.sumisoSupremo, 'user')
    }

    hasDominanteSupremo() {
        return Object.hasOwn(this.dominanteSupremo, 'user')
    }

    //? SET METHODS

    setSumimetro(user, value) {
        this.sumimetro.set(user, value);
        this.sumiso = value.sumiso;
        this.dominante = value.dominante;
    }

    setSumisoSupremo(user) {
        this.sumisoSupremo = {
            user: user,
            sumiso: this.sumiso
        };
    }

    setDominanteSupremo(user) {
        this.dominanteSupremo = {
            user: user,
            dominante: this.dominante
        };
    };

    setDateString(dateString) {
        this.date = dateString;
    }

    getSumimetroDB = getSumimetroDB

}

module.exports = SUMIMETRO;

async function getSumimetroDB(user, date) {
    const sumimetro = await sumimetroSchema.findOne({ channel: this.channel, username: user }).sort({ timestamp: -1 });
    if (sumimetro === null) return null;
    let sumiDate = sumimetro.date.day + '/' + sumimetro.date.month + '/' + sumimetro.date.year;
    if (sumiDate !== date) return null;
    let newSumiDate = {
        sumiso: sumimetro.submissive,
        dominante: sumimetro.dominant
    }
    user = user.toLowerCase();
    await this.setSumimetro(user, newSumiDate);
    return true;
}

async function getSumisoSupremoFromDB() {
    const sumisoSupremo = await sumimetroSchema.findOne({ channel: this.channel, type: 'sumiso' }).sort({ timestamp: -1 });
    if (sumisoSupremo === null) return null;
    this.setSumisoSupremo(sumisoSupremo.username);
    return true;
}

async function getDominanteSupremoFromDB() {
    const dominanteSupremo = await sumimetroSchema.findOne({ channel: this.channel, type: 'dominante' }).sort({ timestamp: -1 });
    if (dominanteSupremo === null) return null;
    this.setDominanteSupremo(dominanteSupremo.username);
    return true;
}


//!   !cc create command  !(texto)  !ct create timer  !ct (nombre del comando) (tiempo en segundos)  !ctc  Create text comando 