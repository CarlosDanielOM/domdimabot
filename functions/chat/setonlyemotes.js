const { getTwitchHelixURL } = require('../../util/links');
const { getStreamerHeaderById } = require('../../util/headers');

async function setOnlyEmotes(channelID, emotes = true, modID = 698614112) {
    let headers = await getStreamerHeaderById(channelID);
    
    let response = await fetch(`${getTwitchHelixURL()}/chat/settings?broadcaster_id=${channelID}&moderator_id=${modID}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
            emote_mode: emotes
        })
    });

    
    let data = await response.json();
    if(data.error) return data;
    data = data.data[0];

    return data;
}

module.exports = setOnlyEmotes;