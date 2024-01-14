just: {
    response: () => {
        if (channel === '#d0jiart') return;
        if (!isMod) return client.say(channel, `No tienes permisos para hacer eso.`);
        let justchattingid = '509658';
        axios({
            method: 'patch',
            url: `${URI}channels?broadcaster_id=${broadcasterID}`,
            headers: streamerHeader,
            data: {
                game_id: justchattingid
            }
        })
            .then((res) => {
                client.say(channel, `${tags['display-name']} --> a cambiado a Just Chatting`);
            })
            .catch((error) => {
                console.log(error);
            });
    }
}