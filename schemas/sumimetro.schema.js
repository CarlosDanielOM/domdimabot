const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sumimetroSchema = new Schema({
    channel: String,
    username: String,
    dominant: Number,
    submissive: Number,
    timestamp: Date,
    date: String
});

const Sumimetro = mongoose.model('Sumimetro', sumimetroSchema);

module.exports = Sumimetro;