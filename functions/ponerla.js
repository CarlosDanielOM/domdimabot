function ponerla(user) {
    let probability = Math.floor(Math.random() * 100) + 1;
    return { message: `La probabilidad de que ${user} la ponga esta noche es de ${probability}%` };
}

module.exports = ponerla;