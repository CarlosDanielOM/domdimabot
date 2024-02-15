require('dotenv').config();
const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require('@google/generative-ai');

const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const model = gemini.getGenerativeModel({ model: 'gemini-pro' })

async function generateText(prompt) {
    const parts = [
        { text: prompt }
    ]

    const genOptions = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 400,
    }

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE
        }
    ]

    const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig: genOptions,
        safetySettings
    })
    const response = await result.response;
    const text = response.text();

    return text;
}

module.exports = {
    generateText
}