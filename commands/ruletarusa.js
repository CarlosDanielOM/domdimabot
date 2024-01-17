const { timeoutUser } = require('../functions/index');

function ruletarusa() {
    let probability = Math.floor(Math.random() * 120) + 1;
    if (probability % 3 === 0) {
        return true;
    } else {
        return false;
    }
}

module.exports = ruletarusa;