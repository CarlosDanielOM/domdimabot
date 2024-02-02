const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sumimetroSchema = new Schema({
    channel: String,
    username: String,
    login: String,
    dominant: Number,
    submissive: Number,
    timestamp: { type: Date, default: Date.now },
    date: {
        day: Number,
        month: Number,
        year: Number
    }
});

const Sumimetro = mongoose.model('Sumimetro', sumimetroSchema);

module.exports = Sumimetro;