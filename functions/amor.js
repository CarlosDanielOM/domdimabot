function amor(tags, argument) {
    let touser = argument || null;
    let user = tags['display-name'];
    if (touser === null) return { message: `Se te olvido poner a la persona a la que quieres medir el amor. No mas por eso te quedaras solter@ toda tu vida.` }
    let viewers = touser.split(' ');
    let user1 = viewers[0];
    let user2 = viewers[1] || null;
    let multiple = false;
    if (user2 !== null) {
        user = user1;
        touser = user2.replace('@', '');
        multiple = true;
    }

    if (touser.toLowerCase() === tags.username && !multiple) {
        return { message: `No te puedes medir el amor a ti mismo. No seas tan solitario.` };
    }
    let love = Math.floor(Math.random() * 100) + 1;
    return { message: `El amor entre ${user} y ${touser} es de ${love}%` }
}

module.exports = amor;