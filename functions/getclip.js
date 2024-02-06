const { getTwitchHelixURL } = require('../util/links');
const getUserID = require('./getuserid');
const { getStreamerHeader } = require('../util/headers')

async function getClip(channel, clipID) {
    let headers = await getStreamerHeader(channel);
    let response = await fetch(`${getTwitchHelixURL()}/clips?id=${clipID}`, {
        method: 'GET',
        headers: headers
    });

    let data = await response.json();

    if (data.error) {
        switch (data.status) {
            case 400:
                return { error: 'Bad request', reason: 'Missing required parameter(s)', status: 400 };
            case 401:
                return { error: 'Unauthorized', reason: 'Missing required permissions', status: 401 };
            case 404:
                return { error: 'Not found', reason: 'Clip not found', status: 404 };
            default:
                return { error: 'Unknown error', reason: 'Unknown error', status: 500 };
        }
    }

    if (data.data.length === 0) {
        return { error: 'Not found', reason: 'Clip not found', status: 404 };
    }

    data = data.data[0];

    return { error: false, data: data, status: 200 }

}

module.exports = getClip;