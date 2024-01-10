const { getUrl } = require('../util/dev')

async function showClip(channel, data) {
    let random = Math.floor(Math.random() * data.length);
    let clip = data[random];
    let duration = clip['duration'];
    let thumbnail = clip['thumbnail_url'];

    if (!duration || !thumbnail) return null;

    let clipResponse = await fetch(`${getUrl()}/clip/${channel}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            duration,
            thumbnail
        })
    });

    let clipData = clipResponse;

    return clipData;
}

module.exports = showClip;