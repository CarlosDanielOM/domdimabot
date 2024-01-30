const { getStreamerHeader } = require('../../util/headers')
const getUserID = require('../getuserid')

async function deleteModerator(channel, userID) {
    const headers = await getStreamerHeader(channel);
    const channelID = await getUserID(channel);

    let response = await fetch(`${this.helixURL}/moderation/moderators?broadcaster_id=${channelID}&user_id=${userID}`, {
        method: 'DELETE',
        headers: headers
    })

    if (response.status === 204) return { error: false, status: 204 };

    let json = await response.json();

    if (json.error) return json;

}

module.exports = deleteModerator;