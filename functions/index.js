let shoutoutFunction = require('./shoutout.function');
let getUserIDFunction = require('./get_user_id.function');

module.exports = {
    shoutout: shoutoutFunction.send(),
    getUserID: getUserIDFunction.getUserID()
}