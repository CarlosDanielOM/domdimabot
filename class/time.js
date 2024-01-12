class TIME {
    constructor() {
        this.time = null;
    }

    async init() {
        this.time = null;
    }

    //? GET METHODS
    getTime() {
        return this.time;
    }

    //? SET METHODS
    setTime(time) {
        this.time = time;
    }

    //? HAS METHODS
    hasTime() {
        return this.time !== null;
    }

    //? DELETE METHODS
    deleteTime() {
        this.time = null;
    }

    //? OTHER METHODS
    getDateinString() {
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        let dateinString = `${day}/${month}/${year}`;

        return { day, month, year, dateinString };
    }

}

module.exports = new TIME();