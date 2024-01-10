const Cooldown = require('../class/cooldown');

let shoutouts = new Cooldown();
let newChatter = new Cooldown();

module.exports = {
    shoutouts,
    newChatter
}