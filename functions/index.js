const timeoutUser = require('./timeoutuser');
const announcement = require('./announcement');
const showclip = require('./showclip');
const getclips = require('./getclips');
const getUserID = require('./getuserid');
const getChannel = require('./getchannel');
const shoutout = require('./shoutout');

//* Importing Prediction Functions
const prediction = require('./prediction');


module.exports = {
    timeoutUser: timeoutUser,
    makeAnnouncement: announcement,
    showClip: showclip,
    getClips: getclips,
    getUserID: getUserID,
    getChannel: getChannel,
    makeShoutout: shoutout,
    prediction: prediction
}