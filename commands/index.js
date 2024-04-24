const shoutout = require('./shoutout');
const ruletarusa = require('./ruletarusa');
const promo = require('./promo');
const prediction = require('./prediction');
const game = require('./game');
const title = require('./title');
const poll = require('./poll');
const sumimetro = require('./sumimetro');
const onlyEmotes = require('./onlyemotes');
const cmd = require('./command')
const followage = require('./followage');
const ip = require('./ip');
const createClip = require('./createclip');
const commandList = require('./commandlist');
const speachChat = require('./speach');
const chiste = require('./chiste');
const enableCommand = require('./enablecommand');
const disableCommand = require('./disablecommand');
const duelo = require('./duelo');
const furrometro = require('./furrometro');
const addModerator = require('./addmoderator');
const getTotalSubs = require('./gettotalsubs');
const addVIPCommand = require('./addvip');
const removeVIPCommand = require('./removevip');
const createTimerCommand = require('./createtimercomand');

module.exports = {
    shoutout,
    ruletarusa,
    promo,
    prediction,
    game,
    title,
    poll,
    sumimetro: sumimetro.sumimetro,
    resetSumimetro: sumimetro.resetSumimetro,
    onlyEmotes,
    cmd,
    followage,
    ip,
    createClip,
    commandList,
    speachChat,
    chiste,
    enableCommand,
    disableCommand,
    duelo,
    furrometro,
    addModerator,
    getTotalSubs,
    addVIP: addVIPCommand,
    unVIP: removeVIPCommand,
    createTimerCommand
}