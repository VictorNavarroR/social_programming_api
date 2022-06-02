const mongoose = require('mongoose')
const config = require('./config')

const { mongoUser, mongoPass } = config

const DB_URL = `mongodb+srv://${mongoUser}:${mongoPass}@upgrade-nov-2021.yor7b.mongodb.net/social_programming?retryWrites=true&w=majority`

const connectDB = () => mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology:true
});


module.exports = { connectDB, DB_URL };
