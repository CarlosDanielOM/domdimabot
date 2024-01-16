const Cooldown = require('../class/cooldown');

let shoutouts = new Cooldown();
let newChatter = new Cooldown();
let command = new Cooldown();

module.exports = {
    shoutouts,
    newChatter,
    command
}