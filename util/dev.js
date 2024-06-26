let production = true;

function isProduction() {
    return production;
}

function getUrl() {
    if (production === true) {
        return "https://api.domdimabot.com";
    } else {
        return "http://localhost:3000";
        return "https://api.domdimabot.com";
    }
}

async function refreshAllTokens(fun) {
    try {
        if (production) {
            await fun();
        }
    } catch (error) {
        console.error('Error on refreshAllTokens:', error);
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