const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appConfigSchema = new Schema({
    name: String,
    access_token: {
        iv: String,
        content: String
    }
});

module.exports = mongoose.model('app_config', appConfigSchema);