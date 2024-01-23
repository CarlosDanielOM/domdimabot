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

    const hour = (1000 * 3600);
    const day = 24;
    const month = 30.5;
    const year = 365;

    let days = 0;
    let months = 0;
    let years = 0;

    let hours = Math.floor(diff / hour);
    days = Math.floor(hours / day);
    hours = hours % day;
    months = Math.floor(days / month);
    days = days % month;
    years = Math.floor(months / year);
    months = months % year;

    let message = `${user} sigue a ${channel} desde hace `;
    if (years > 0) {
        message += `${years} año${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
        message += `${years > 0 ? ', ' : ''}${months} mes${months > 1 ? 'es' : ''}`;
    }
    if (days > 0) {
        message += `${years > 0 || months > 0 ? ', ' : ''}${days} día${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
        message += `${years > 0 || months > 0 || days > 0 ? ', ' : ''}${hours} hora${hours > 1 ? 's' : ''}`;
    }

    return { error: false, message };

}

module.exports = followage;