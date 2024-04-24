class TimerService {
    constructor() {
        this.timers = new Map();
    }

    addTimer(timerName, timerArray) {
        this.timers.set(timerName, timerArray);
    }

    getTimer(timerName) {
        return this.timers.get(timerName);
    }

    getTimers() {
        return this.timers;
    }

    clearTimer(timerName, cmd) {
        let timers = this.getTimer(timerName);
        if (!timers) return;
        timers.forEach(timer => {
            if (timer.cmd === cmd) {
                clearInterval(timer.timer);
                timers.splice(timers.indexOf(timer), 1);
            }
        });
    }

    clearAllTimers() {
        this.timers.forEach(timer => {
            clearInterval(timer.timer);
        });
        this.timers.clear();
    }

}

module.exports = new TimerService();