let production = false;

function isProduction() {
    return production;
}

function getUrl() {
    if (production === true) {
        return "https://domdimabot.com";
    } else {
        return "http://localhost:3000";
    }
}

function refreshAllTokens(fun, updateDBFetch) {
    if (production) {
        fun();
        updateDBFetch();
    }
}

function getClientOpts() {
    let options = null;
    if (production) {
        options = {
            options: {
                debug: false,
            },
            identity: {
                username: process.env.TWITCH_USERNAME,
                password: process.env.User_Token_Auth,
            },
            channels: [''],
        };
    } else {
        options = {
            options: {
                debug: true,
            },
            identity: {
                username: process.env.TWITCH_USERNAME,
                password: process.env.User_Token_Auth,
            },
            channels: [''],
        };
    }
    return options;
}

async function connectChannels(fun, client) {
    if (production) {
        await fun();
    } else {
        await client.join('cdom201');
    }
}

module.exports = {
    isProduction,
    getUrl,
    refreshAllTokens,
    getClientOpts,
    connectChannels,
}