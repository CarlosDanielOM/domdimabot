let token = localStorage.getItem('token');

if (token !== null) {
    window.location.replace('https://domdimabot.com/login');
}

let scope = 'user:read:email';
scope = encodeURIComponent(scope);

let twitchAuthURL = `https://id.twitch.tv/oauth2/authorize?response_type=token&force_verify=true&client_id=jl9k3mi67pmrbl1bh67y07ezjdc4cf&redirect_uri=https://domdimabot.com/login&response_type=token&scope=${scope}`;

let loginButton = document.getElementById('twitchLoginBtn');

loginButton.addEventListener('click', (e) => {
    window.location.href = twitchAuthURL;
})