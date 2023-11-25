let channel = window.location.pathname.split('/')[2];
console.log(channel);
const socket = io(`/${channel}`);

socket.on('play-clip', (data) => {
    const clipLink = data.clip;

    const clipPlayer = document.getElementById('refreshingIframe');
    const channelName = document.getElementById('channelName');

    channelName.innerText = data.channel;
    clipPlayer.src = `${clipLink}&parent=localhost&preload=auto&autoplay=true&muted=false`;
})