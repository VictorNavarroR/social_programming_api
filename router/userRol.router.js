const express = require('express')
const db = require('../db')
const UserRols = require('../models/UserRols')


//create client route
const userRolRouter = express.Router()

userRolRouter.get('/', (req, res, next) => {

    UserRols.find()
        .then( userRols => {
            return res.status(200).json(userRols);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

userRolRouter.post('/', (req, res, next) => {

    const newRol = new UserRols({
        name: req.body.name,
        level: req.body.level,
    })

    return newRol.save()
            .then( () => {
                return res.status(201).json(newRol)
            })
            .catch( err => {
                const error = new Error(err)
                error.status = 500
                return next(error)
            })


    
})

module.exports = userRolRouter;