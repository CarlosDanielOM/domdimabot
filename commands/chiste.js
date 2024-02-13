const { generateText } = require('../util/gemini');

async function chiste(type) {
    let prompt = "Cuéntame un chiste ";
    if (!type) {
        prompt += "malo";
    } else {
        prompt += `de ${type}`;
    }

    const text = await generateText(prompt);

    const response = {
        message: text,
        cooldown: 10,
        error: false
    }


    return response;
}

module.exports = chiste;