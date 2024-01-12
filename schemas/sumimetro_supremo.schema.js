const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sumimetroSupremoSchema = new Schema({
    channel: String,
    username: String,
    type: String,
    percent: Number,
    timestamp: Date,
    date: {
        day: Number,
        month: Number,
        year: Number
    }
});

const SumimetroSupremo = mongoose.model('Sumimetro_Supremo', sumimetroSupremoSchema);

module.exports = SumimetroSupremo;