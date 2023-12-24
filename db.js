const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
    init: () => {
        const dbOptions = {};
        mongoose.connect(process.env.MONGO_URI, dbOptions);
        mongoose.Promise = global.Promise;

        mongoose.connection.on('connected', () => {
            console.log(`Connection to MongoDB has been established`);
        })

        mongoose.connection.on('error', () => {
            console.log(`There was an error establishing a connectio to MongoDB. \n Error: ${err.stack}`);
        })
        
        mongoose.connection.on('disconnected', () => {
            console.log(`MongoDB has been successfuly disconected`);
        })
        
    }
}