const {getTwitchHelixURL} = require('../../util/links')
const {getStreamerHeaderById} = require('../../util/headers');

async function getOnlyEmotes(channelID, modID = 698614112) {
    let params = `?broadcaster_id=${channelID}`
    let headers = await getStreamerHeaderById(channelID);

    if (modID) {
        params += `&moderator_id=${modID}`
    }

    let response = await fetch(`${getTwitchHelixURL()}/chat/settings${params}`, {
        method: 'GET',
        headers: headers
    });

    let data = await response.json();
    data = data.data[0];

    let resData = {
        error: false,
        message: null,
        status: data.emote_mode
    }

    return resData;
}

module.exports = getOnlyEmotes;