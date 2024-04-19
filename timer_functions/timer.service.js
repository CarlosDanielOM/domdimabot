class TimerService {
    constructor() {
        this.timers = new Map();
    }

    setTimer(cmd, time, callback) {
        this.timers.set(cmd, setInterval(callback, (time * (1000 * 60))));
    }

    clearTimer(cmd) {
        clearInterval(this.timers.get(cmd));
    }

    getTimers() {
        return this.timers;
    }

    getTimer(cmd) {
        return this.timers.get(cmd);
    }

    clearAllTimers() {
        this.timers.forEach((timer) => {
            clearInterval(timer);
        });
        this.timers.clear();
    }

}

module.exports = TimerService;