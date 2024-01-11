function mecabe(user) {
    let size = Math.floor(Math.random() * 28) + 3;
    if (size <= 10) {
        return { message: `A ${user} le caben ${size}cm de tula. Poquito porque ya comio.` };
    } else if (size > 18 && size <= 24) {
        return { message: `A ${user} le caben ${size}cm de tula. Ya se le esta antojando.` };
    } else if (size > 24) {
        return { message: `A ${user} le caben ${size}cm de tula. Ya dasela que se muere de hambre.` };
    } else {
        return { message: `A ${user} le caben ${size}cm de tula. Ya comio pero le cabe mas.` };
    }
}

module.exports = mecabe;