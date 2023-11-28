const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sumimetroSchema = new Schema({
    channel: String,
    username: String,
    dominant: Number,
    submisive: Number,
    timestamp: Date
});

const Sumimetro = mongoose.model('Sumimetro', sumimetroSchema);

module.exports = Sumimetro;