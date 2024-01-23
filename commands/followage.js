const { getTwitchHelixURL } = require('../util/links')
const { getUserID } = require('../functions');
const { getStreamerHeader } = require('../util/headers')

async function followage(channel, user) {
    let headers = await getStreamerHeader(channel);

    const userID = await getUserID(user);
    const channelID = await getUserID(channel);

    let response = await fetch(`${getTwitchHelixURL()}/channels/followers?broadcaster_id=${channelID}&user_id=${userID}`, {
        method: 'GET',
        headers
    });

    let data = await response.json();

    if (data.error) {
        return { error: true, reason: data.message, status: data.status };
    }

    data = data.data[0];

    if (data === undefined) {
        return { error: true, reason: `${user} no sigue a ${channel}` };
    }

    const date = new Date(data.followed_at);
    const now = new Date();

    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 3600));
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(weeks / 4);
    const years = Math.floor(months / 12);

    let responseString = `${user} sigue a ${channel} hace `;

    if (years > 0) {
        responseString += `${years} año${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
        responseString += `${months} mes${months > 1 ? 'es' : ''}`;
    } else if (weeks > 0) {
        responseString += `${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else if (days > 0) {
        responseString += `${days} día${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        responseString += `${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
        responseString += 'menos de una hora';
    }

    return { error: false, message: responseString };

}

module.exports = followage;