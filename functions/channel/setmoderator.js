const getUserID = require('../getuserid');

async function setModerator(user = '698614112') {
    let response = await fetch(`${this.helixURL}/moderation/moderators?broadcaster_id=${this.userID}&user_id=${user}`, {
        method: 'POST',
        headers: this.streamerHeaders
    });

    if (response.status === 204) return { error: false, message: 'Moderator added.' };

    let json = await response.json();

    if (json.error) {
        return { error: true, message: json.message };
    }

}

module.exports = setModerator;