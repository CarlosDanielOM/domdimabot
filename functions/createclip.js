const { getTwitchHelixURL } = require('../util/links');
const getUserID = require('./getuserid');
const { getStreamerHeader } = require('../util/headers')

async function createClip(channel) {
    let userID = await getUserID(channel);
    let headers = await getStreamerHeader(channel);

    let response = await fetch(`${getTwitchHelixURL()}/clips?broadcaster_id=${userID}`, {
        method: 'POST',
        headers: headers
    });

    let data = await response.json();

    if (data.error) {
        switch (data.status) {
            case 400:
                return { error: 'Bad request', reason: 'Missing required parameter(s)', status: 400 };
            case 401:
                return { error: 'Unauthorized', reason: 'Missing authentication token', status: 401 };
            case 403:
                return { error: 'Forbidden', reason: 'The user does not have permission to create a clip on the specified channel', status: 403 };
            case 404:
                return { error: 'Not found', reason: 'The Streamer is not live', status: 404 };
            default:
                return { error: 'Unknown error', reason: 'Unknown error', status: 500 };
        }
    }

    data = data.data[0];

    return { error: false, clipID: data.id, clipURL: data.url, status: 200 }

}

module.exports = createClip;

