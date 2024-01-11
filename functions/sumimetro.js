function sumimetro() {
    let user = argument || tags['display-name'];
    let dominante = Math.floor(Math.random() * 100) + 1;
    let sumiso = 100 - dominante;

    let message = `Los lectores del sumimetro reflejan que ${user} tiene ${sumiso}% de sumiso y ${dominante}% de dominante`;

    return { message }
}

module.exports = sumimetro;