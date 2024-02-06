const { getClip, createClip } = require('../functions')

async function createChannelClip(channel) {
    let createClipResponse = await createClip(channel);

    if (createClipResponse.error) {
        return createClipResponse;
    }

    let clipID = createClipResponse.clipID;

    let clipData = await checkClip(channel, clipID);

    if (clipData.status == 404) {
        return { error: 'Not found', reason: 'There was an error creating the clip.', status: 404 };
    }

    if (clipData.status == 200) {
        return { error: false, message: `Clip Created Successfully... ${clipData.data.url}`, clipData: clipData, status: 200 };
    }

}

module.exports = createChannelClip;

async function checkClip(channel, clipID) {
    let retries = 0;
    let getClipResponse = await getClip(channel, clipID);

    if (getClipResponse.error) {
        if (getClipResponse.status == 404 && retries < 8) {
            await new Promise(r => setTimeout(r, 2000)); // wait for 2 seconds
            return checkClip(channel, clipID, retries + 1); // retry
        }
        return getClipResponse;
    }

    return getClipResponse;
}