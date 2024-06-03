const dragonflyDB = require('../util/database/dragonflydb');

const countdownTimerSchema = require('../schemas/countdowntimer');
const countdownTimerConfigSchema = require('../schemas/countdowntimerconfig');
const streamers = require('../class/streamers');

const commandSchema = require('../schemas/command');

const { getUrl } = require('../util/dev');

let cache;

async function countdownTimer(channel, argument, userLevel) {
    let streamer = await streamers.getStreamer(channel);
    
    let commandInfo = await commandSchema.findOne({ channelID: streamer.user_id, name: 'Countdown Timer' });
    
    if (!commandInfo) return {error: true, message: 'Command not found'};
    
    if (commandInfo.userLevel > userLevel) return {error: true, message: 'You do not have permission to use this command'};
    
    cache = await dragonflyDB.getClient();
    
    let countdownTimer = await cache.get(`${channel}:countdown:timer`);
    let countdownTimerConfig = await cache.get(`${channel}:countdown:config`);
    if (!countdownTimer) {
        countdownTimer = await countdownTimerSchema.findOne({channelID: streamer.user_id, active: true});
        if(!countdownTimer) return {error: true, message: 'No active countdown timer found'};
    }
    if (!countdownTimerConfig) {
        countdownTimerConfig = await countdownTimerConfigSchema.findOne({channelID: streamer.user_id});
        if(!countdownTimerConfig) return {error: true, message: 'No countdown timer config found'};
    }

    if (!countdownTimer) return {error: true, message: 'No active countdown timer found'};

    let response;
    let data;
    let time;

    argument = argument.split(' ');

    switch (argument[0]) {
        case 'start':
            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/resume`, {
                method: 'POST',
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            
            break;
        case 'pause':
            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/pause`, {
                method: 'POST',
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            break;
        case 'resume':
            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/resume`, {
                method: 'POST',
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            break;
        case 'add':
            time = argument[1];
            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/add`, {
                method: 'POST',
                body: JSON.stringify({time}),
                headers: {'Content-Type': 'application/json'}
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            break;
        case 'remove':
            time = argument[1];
            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/substract`, {
                method: 'POST',
                body: JSON.stringify({time}),
                headers: {'Content-Type': 'application/json'}
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            break;
        case 'bits':
            let bitAmount = argument[1] ?? 1;

            let bitTime = countdownTimerConfig.bits;
            
            let timeAmount = Math.floor((bitTime / 100) * bitAmount);

            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/add`, {
                method: 'POST',
                body: JSON.stringify({time: timeAmount}),
                headers: {'Content-Type': 'application/json'}
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            
            break;
        case 'tier1':
            let tier1Amount = argument[1] ?? 1;

            let tier1Time = Number(tier1Amount) * Number(countdownTimerConfig.tier1);

            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/add`, {
                method: 'POST',
                body: JSON.stringify({time: tier1Time}),
                headers: {'Content-Type': 'application/json'}
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            break;
        case 'tier2':
            let tier2Amount = argument[1] ?? 1;

            let tier2Time = tier2Amount * countdownTimerConfig.tier2;

            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/add`, {
                method: 'POST',
                body: JSON.stringify({time: tier2Time}),
                headers: {'Content-Type': 'application/json'}
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            break;
        case 'tier3':
            let tier3Amount = argument[1] ?? 1;

            let tier3Time = tier3Amount * countdownTimerConfig.tier3;

            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/add`, {
                method: 'POST',
                body: JSON.stringify({time: tier3Time}),
                headers: {'Content-Type': 'application/json'}
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            break;
        case 'follows':
            let followAmount = argument[1] ?? 1;

            let followTime = followAmount * countdownTimerConfig.follows;

            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/add`, {
                method: 'POST',
                body: JSON.stringify({time: followTime}),
                headers: {'Content-Type': 'application/json'}
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            break;
        case 'raids':
            let raidAmount = argument[1] ?? 1;

            let raidTime = raidAmount * countdownTimerConfig.raids;

            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/add`, {
                method: 'POST',
                body: JSON.stringify({time: raidTime}),
                headers: {'Content-Type': 'application/json'}
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            break;
        case 'viewers':
            let viewerAmount = argument[1] ?? 1;

            let viewerTime = viewerAmount * countdownTimerConfig.viewers;

            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/add`, {
                method: 'POST',
                body: JSON.stringify({time: viewerTime}),
                headers: {'Content-Type': 'application/json'}
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            break;
        case 'donations':
            let donationAmount = argument[1] ?? 1;

            let donationTime = donationAmount * countdownTimerConfig.donations;

            response = await fetch(`${getUrl()}/countdowntimer/${streamer.user_id}/timer/add`, {
                method: 'POST',
                body: JSON.stringify({time: donationTime}),
                headers: {'Content-Type': 'application/json'}
            })

            data = await response.json();

            if (data.error) return {error: true, message: data.message};
            return {error: false, message: data.message};
            break;
        default:
            return {error: true, message: 'Invalid argument'};
    }
    
}

module.exports = countdownTimer;