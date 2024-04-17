const getGame = require('./getgame');
const setGame = require('./setgame');
const getTitle = require('./gettitle');
const setTitle = require('./settitle');
const setModerator = require('./setmoderator');
const deleteModerator = require('./deletemoderator');
const setVIP = require('./setvip');
const removeVIP = require('./removevip');
const getTotalSubs = require('./getsubs');

class CHANNEL {

    getGame = getGame;
    setGame = setGame;
    getTitle = getTitle;
    setTitle = setTitle;
    setModerator = setModerator;
    deleteModerator = deleteModerator;
    setVIP = setVIP;
    removeVIP = removeVIP;
    getTotalSubs = getTotalSubs;


}

module.exports = new CHANNEL();