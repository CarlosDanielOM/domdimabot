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
    }

    init(channel) {
        this.channel = channel;
        this.url = getUrl();
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

    getSumisoSupremos() {
        return this.sumisoSupremo;
    }

    getDominanteSupremos() {
        return this.dominanteSupremo;
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

    setSumisoSupremo(value) {
        this.sumisoSupremo = value;
    }

    setDominanteSupremo(value) {
        this.dominanteSupremo = value;
    }

}

module.exports = SUMIMETRO;

function sumimetro(user) {
    
}