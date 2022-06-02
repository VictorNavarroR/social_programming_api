const jwt = require('jsonwebtoken')
const config = require('../config')

const isAuthenticated = (req, res, next) => {

    const token = req.headers.authorization
    // decode token
    if (token) {

        const TokenArray = token.split(" ");

        if(!TokenArray[0].includes('Bearer')) {
            return res.status(403).json('Invalid authorization mode');
        }       

      // verifies secret and checks exp
      jwt.verify(TokenArray[1], config.secret, async function(err, decoded) {
          if (err) {
              return res.status(401).json({"error": true, "message": err.name });
          }
        req.decoded = decoded;
        next();
      });
    } else {
      // if there is no token
      // return an error
      return res.status(403).send({
          "error": true,
          "message": 'No token provided.'
      });
    }
}

module.exports = isAuthenticated