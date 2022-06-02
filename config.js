require('dotenv').config()

const config = {

    port: process.env.PORT || 5000,
    mongoUser: process.env.MONGO_USER,
    mongoPass: process.env.MONGO_PASS,
    secret: "socialProgrammingApiSecret",
    refreshTokenSecret: "socialProgrammingApiRefreshSecret",
    tokenLife: 5900,
    refreshTokenLife: 86400

}


module.exports = config