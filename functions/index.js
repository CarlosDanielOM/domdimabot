const timeoutUser = require('./timeoutuser');
const announcement = require('./announcement');
const showclip = require('./showclip');
const getclips = require('./getclips');
const getUserID = require('./getuserid');
const getChannel = require('./getchannel');
const shoutout = require('./shoutout');
const speach = require('./speach');
const sumimetro = require('./sumimetro');
const amor = require('./amor');
const ponerla = require('./ponerla');
const mecabe = require('./mecabe');
const memide = require('./memide');

//* Importing Prediction Functions
const prediction = require('./prediction');
const poll = require('./poll');


module.exports = {
    timeoutUser: timeoutUser,
    makeAnnouncement: announcement,
    showClip: showclip,
    getClips: getclips,
    getUserID: getUserID,
    getChannel: getChannel,
    makeShoutout: shoutout,
    prediction: prediction,
    poll: poll,
    speach: speach,
    sumimetro: sumimetro,
    amor: amor,
    ponerla: ponerla,
    mecabe: mecabe,
    memide: memide
}