function memide(user) {
    let message;
    let size = Math.floor(Math.random() * 28) + 3;
    if (size <= 10) {
        message = `El tamaño de la tula de ${user} mide ${size}cm. Pero que chiquito JAJAJA!`;
    } else if (size > 18 && size <= 24) {
        message = `El tamaño de la tula de ${user} mide ${size}cm. Fua pero mira que macizo.`;
    } else if (size > 24) {
        message = `El tamaño de la tula de ${user} mide ${size}cm. Esa madre ya paga hasta impuestos.`;
    } else {
        message = `El tamaño de la tula de ${user} mide ${size}cm. Algo promedio eh?`;
    }

    return { message }
}

module.exports = memide;