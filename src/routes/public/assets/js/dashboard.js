let id = localStorage.getItem('id');
let name = localStorage.getItem('name');

name = 'ariascarletvt'

let baseUrl = 'https://domdimabot.com'

let url = `https://id.twitch.tv/oauth2/authorize?response_type=code&force_verify=true&client_id=jl9k3mi67pmrbl1bh67y07ezjdc4cf&redirect_uri=${baseUrl}/auth&scope=analytics%3Aread%3Aextensions+analytics%3Aread%3Agames+bits%3Aread+channel%3Amanage%3Aads+channel%3Aread%3Aads+channel%3Amanage%3Abroadcast+channel%3Aread%3Acharity+channel%3Aedit%3Acommercial+channel%3Aread%3Aeditors+channel%3Amanage%3Aextensions+channel%3Aread%3Agoals+channel%3Aread%3Aguest_star+channel%3Amanage%3Aguest_star+channel%3Aread%3Ahype_train+channel%3Amanage%3Amoderators+channel%3Aread%3Apolls+channel%3Amanage%3Apolls+channel%3Aread%3Apredictions+channel%3Amanage%3Apredictions+channel%3Amanage%3Araids+channel%3Aread%3Aredemptions+channel%3Amanage%3Aredemptions+channel%3Amanage%3Aschedule+channel%3Aread%3Astream_key+channel%3Aread%3Asubscriptions+channel%3Amanage%3Avideos+channel%3Aread%3Avips+channel%3Amanage%3Avips+clips%3Aedit+moderation%3Aread+moderator%3Amanage%3Aannouncements+moderator%3Amanage%3Aautomod+moderator%3Aread%3Aautomod_settings+moderator%3Amanage%3Aautomod_settings+moderator%3Amanage%3Abanned_users+moderator%3Aread%3Ablocked_terms+moderator%3Amanage%3Ablocked_terms+moderator%3Amanage%3Achat_messages+moderator%3Aread%3Achat_settings+moderator%3Amanage%3Achat_settings+moderator%3Aread%3Achatters+moderator%3Aread%3Afollowers+moderator%3Aread%3Aguest_star+moderator%3Amanage%3Aguest_star+moderator%3Aread%3Ashield_mode+moderator%3Amanage%3Ashield_mode+moderator%3Aread%3Ashoutouts+moderator%3Amanage%3Ashoutouts+user%3Aedit+user%3Aedit%3Afollows+user%3Aread%3Ablocked_users+user%3Amanage%3Ablocked_users+user%3Aread%3Abroadcast+user%3Amanage%3Achat_color+user%3Aread%3Aemail+user%3Aread%3Afollows+user%3Aread%3Asubscriptions+user%3Amanage%3Awhispers+channel%3Abot+channel%3Amoderate+chat%3Aedit+chat%3Aread+user%3Abot+user%3Aread%3Achat+whispers%3Aread+whispers%3Aedit&state=${name}`;

let joinBtn = document.getElementById('join');
let leaveBtn = document.getElementById('leave');
let permissionBtn = document.getElementById('permissions');

let channel = localStorage.getItem('name');

document.getElementById('triggerRef').setAttribute('href', `/trigger/manage/${channel}`);

joinBtn.addEventListener('click', async (e) => {
    let res = await fetch(baseUrl + '/bot/join', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id, action: 'join' })
    });

    let data = await res.json();

    console.log(data);
});

leaveBtn.addEventListener('click', async (e) => {
    let res = await fetch(baseUrl + '/bot/leave', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id, action: 'leave' })
    });

    let data = await res.json();

    console.log(data);
});

permissionBtn.addEventListener('click', async (e) => {
    window.location.href = url;
});

//! MODULES !//

let moduleCost = 10000;
let moduleCooldown = 0;
let moduleSkipQueue = true;
let modulePriceIncrease = 0;
let moduleReturnOriginalCost = false;

const addVIPModule = document.getElementById('addVIPReward');
const removeVIPModule = document.getElementById('removeVIPReward');
const moduleForm = document.getElementById('formModule');

let VIPRewardID = null;

window.onload = async () => {
    checkIfVIPRewardExists();
};

moduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    moduleCost = document.getElementById('moduleCost').value;
    moduleCooldown = document.getElementById('moduleCooldown').value;
    moduleSkipQueue = document.getElementById('moduleSkipQueue').checked;
    modulePriceIncrease = document.getElementById('moduleIncrease').value;
    moduleReturnOriginalCost = document.getElementById('moduleReturnOriginalCost').checked;

});


addVIPModule.addEventListener('click', async (e) => {
    let rewardData = {
        title: 'VIP',
        cost: moduleCost,
        skipQueue: moduleSkipQueue,
        cooldown: moduleCooldown,
        priceIncrease: modulePriceIncrease,
        rewardMessage: '',
        returnToOriginalCost: moduleReturnOriginalCost
    }

    let res = await fetch(`${baseUrl}/${name}/create/reward`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rewardData)
    });

    let data = await res.json();

    if (data.error) return createAlert(data.reason, 'danger');

    createAlert('Modulo Activado con exito', 'success');

    VIPRewardID = data.data.id;

    checkIfVIPRewardExists();
});

removeVIPModule.addEventListener('click', async (e) => {
    let rewardData = {
        title: 'VIP',
    }

    let res = await fetch(`${baseUrl}/${name}/delete/reward/${VIPRewardID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rewardData)
    });

    let data = await res.json();

    if (data.error) return createAlert(data.reason, 'danger');

    createAlert('Modulo Desactivado con exito', 'success');

    VIPRewardID = null;

    removeVIPModule.attributes.setNamedItem(document.createAttribute('disabled'));
    addVIPModule.attributes.removeNamedItem('disabled');
});

function createAlert(message, type) {
    const alert = document.createElement('div');
    const paragraph = document.createElement('p');
    alert.classList.add('alert', `alert-${type}`);
    paragraph.innerText = message;
    alert.appendChild(paragraph);
    alertContainer.appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

async function checkIfVIPRewardExists() {
    let res = await fetch(`${baseUrl}/points/${name}`);

    let data = await res.json();
    data = data.data;

    data.forEach(reward => {
        if (reward.title === 'VIP') {
            VIPRewardID = reward.id;
            removeVIPModule.attributes.removeNamedItem('disabled');
            addVIPModule.attributes.setNamedItem(document.createAttribute('disabled'));
        }
    });
}