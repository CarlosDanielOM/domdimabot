const eventsubSchema = require('../schemas/eventsub');

async function eventsubRevocation(subscriptionData) {
    let { id, type, version } = subscriptionData;
    let eventsubData = await eventsubSchema.findOne({ id, type, version });
    if(!eventsubData) return console.log({ error: 'No data found', type, condition: subscriptionData.condition });

    await eventsubData.deleteOne();
    console.log({ message: 'Revoked', type, condition: subscriptionData.condition });

}

module.exports = eventsubRevocation;