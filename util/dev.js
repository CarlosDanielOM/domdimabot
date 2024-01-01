let production = false;

function isProduction() {
    return production;
}

function getUrl() {
    if (production === true) {
        return "https://domdimabot.com/";
    } else {
        return "http://localhost:3000/";
    }
}

function refreshAllTokens(fun) {
    if (production) {
        fun();
    }
}

module.exports = {
    isProduction,
    getUrl,
    refreshAllTokens
}