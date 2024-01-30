const { getStreamerHeader } = require('../../util/headers');
const getUserID = require('../getuserid');

async function setModerator(channel, user = 698614112) {
    const headers = await getStreamerHeader(channel);
    const userID = await getUserID(channel);
    let response = await fetch(`${this.helixURL}/moderation/moderators?broadcaster_id=${userID}&user_id=${user}`, {
        method: 'POST',
        headers: headers
    });

    if (response.status === 204) return { error: false, message: 'Moderator added.', status: 204 };

    let json = await response.json();

    if (json.error) {
        return { error: true, reason: json.message, status: json.status };
    }

}

module.exports = setModerator;