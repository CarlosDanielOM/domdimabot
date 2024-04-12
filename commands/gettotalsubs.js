const gettotalsubs = require('../functions/channel/getsubs');

async function getTotalSubs(streamer) {
    let res = await gettotalsubs(streamer);
    if (res.error) return res;

    return { error: false, message: `El total de suscriptores de ${streamer} es de ${res.total}` };
}

module.exports = getTotalSubs;