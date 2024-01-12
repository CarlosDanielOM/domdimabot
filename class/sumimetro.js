const { getUrl } = require('../util/dev');

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
}

module.exports = SUMIMETRO;