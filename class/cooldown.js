class Cooldown {
    constructor() {
        this.cooldowns = new Map();
    }

    setCooldown(id, time) {
        this.cooldowns.set(id, time);
        setTimeout(() => {
            this.cooldowns.delete(id);
        }, (time * 1000));
    }

    showCooldown(id) {
        return this.cooldowns.get(id);
    }

    showCooldowns() {
        return this.cooldowns;
    }

    getCooldown(id) {
        return this.cooldowns.get(id);
    }

    hasCooldown(id) {
        return this.cooldowns.has(id);
    }
}

module.exports = Cooldown;