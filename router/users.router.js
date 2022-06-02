const express = require('express')
const jwt = require('jsonwebtoken')
const db = require('../db')
const User = require('../models/Users')
const passport = require('passport')
const isAuthenticated = require('../middlewares/auth.middleware')
const config = require('../config')
const multer = require('multer')
const upload = require('../middlewares/file.middleware')
const bcrypt = require('bcrypt')

const usersRouter = express.Router()

usersRouter.get('/', isAuthenticated, (req, res, next) => {

    User.find().populate('user_rol')
        .then( User => {
            return res.status(200).json(User);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

usersRouter.get('/:id', (req, res, next) => {
    const id = req.params.id
    User.findById(id).populate('user_rol')
        .then( User => {
            return res.status(200).json(User);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

usersRouter.post('/', isAuthenticated, (req, res, next) => {

    const newUser = new User({
        name: req.body.name,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        user_rol: req.body.user_rol
    })

    return newUser.save()
            .then( () => {
                return res.status(201).json(newUser)
            })
            .catch( err => {
                const error = new Error(err)
                error.status = 500
                return next(error)
            })


    
})

usersRouter.put('/:id', isAuthenticated,  [upload.upload.single('image'), upload.uploadToCloudinary], async (req, res) => {
    const id = req.params.id
 
    const userEdited = new User(req.body)

    userEdited.image = req.file_url ? req.file_url : undefined

    let updateObject = null;
    const encriptedPass = await bcrypt.hash(req.body.password, 10)

    if(req.body.password === 'undefined') {

         updateObject = {
            name: req.body.name,
            lastName: req.body.lastName,
            image:userEdited.image,
        }
    } else {

        updateObject = {
            name: req.body.name,
            lastName: req.body.lastName,
            image:userEdited.image,
            password: encriptedPass
        }
    }

    userEdited._id = id //reasignamos el id para sobreescribir el documento en la DB


    return User.findByIdAndUpdate(id, updateObject, {new:true}).populate('user_rol')
                    .then( userUpdated => {
                        return res.status(200).json(userUpdated)
                    })
                    .catch( err => {
                        const error = new Error(`Usuario no editado ${err}`)
                        error.status = 405;
                        return next(error);
                })
})

usersRouter.put('/ruta/:id',  isAuthenticated, (req, res) => {
    const rutaId = req.params.id

    const userId = req.body.userId;

    return User.findByIdAndUpdate(userId, { $addToSet: { user_paths: rutaId }})
                    .then( userUpdated => {
                        console.log(userId)
                        return res.status(200).json(userUpdated)
                    })
                    .catch( err => {
                        const error = new Error(`Usuario no editado ${err}`)
                        error.status = 405;
                        return next(error);
                })
})


usersRouter.put('/watching/:id',  isAuthenticated, (req, res) => {
    const id = req.params.id

    const user = User.findById(id).then( user => {


            return User.findByIdAndUpdate(id, 
                { $pull: { watching: {video: req.body.watching.video}}})
                    .then( () => {
                        User.findByIdAndUpdate(id, 
                            { $addToSet : { watching: req.body.watching }}, 
                            { new: true })
                                .then( userUpdated => {
                                    return res.status(200).json(userUpdated)
                                })
                                .catch( err => {
                                    const error = new Error(`Usuario no editado ${err}`)
                                    error.status = 405;
                                    return next(error);
                            })
                    })
                    .catch( err => {
                        const error = new Error(`Usuario no editado ${err}`)
                        error.status = 405;
                        return next(error);
                })
              

    })
    
    
})

usersRouter.delete('/',  isAuthenticated, (req, res) => {
    const id = req.params.id

    User.findByIdAndDelete(id)
        .then( () => {
            return res.status(200).json(`El usuario con id ${id} ha sido eliminado`)
        })
        .catch( err => {
            const error = new Error('usuario no encontrado')
            error.status = 405;
            return next(error);
        })
})


usersRouter.post('/register', (req, res, next) => {

    const callback = (error, usuario) => {
        if(error) {
            return next(error)
        }

        req.logIn(usuario, (errorLogin) => {
            //si hay error en login
            if(errorLogin) {
                return next(errorLogin)
            }
            res.status(201).json(usuario)
        })
    }
    passport.authenticate('register', callback)(req)

})

usersRouter.post('/login', (req, res) => {
    const callback = (error, usuario) => {
       if(error) {
           return res.status(500).json({ message: "Usuario o contraseñas no existentes.", error:true })
       }

       const user = {
           name: usuario.name,
           email: usuario.email
       }

       const token = jwt.sign({user}, config.secret, { expiresIn: config.tokenLife})
       const refreshToken = jwt.sign({user}, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife})
       const response = {
           "status": "Usuario loqueado correctamente",
           "id": usuario.id,
           "name": `${usuario.name} ${usuario.lastName}`,
           "image": usuario.image,
           "rol": usuario.user_rol,
           "token": token,
           "user_paths": usuario.user_paths,
           "refreshToken": refreshToken,
           "watching": usuario.watching,
       }
       User.findByIdAndUpdate(usuario.id, { refreshToken: response.refreshToken }, { upsert: true }).then( res => console.log(res));

       return res.status(200).json(response)
    }
    passport.authenticate('login', callback)(req)
    

    
})

usersRouter.post('/token', (req,res) => {

    const postData = req.body

    userHasToken = User.find({email:req.body.email}).then( (user) => {

        if((postData.refreshToken) && (user[0].refreshToken)) {
            const user = {
                "email": postData.email,
                "name": postData.name
            }
            const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
            const response = {
                "token": token,
            }

            res.status(200).json(response);        
        } else {
            res.status(404).send('Invalid request')
        }
        
    }).catch( err => {
        return res.status(500).send('Error inesperado' + err)
    });


})

usersRouter.post('/logout', (req, res, next) => {
    if(!req.body.user) {
       return res.sendStatus(304)
    }
    //cerrar sesion en la petición
    req.logOut();

    //destruir la sesion de la peticion
    req.session.destroy( () => {
        res.clearCookie('connect.sid')
        res.status(200).json({
            message:'Sesion de usuario cerrada',
            logguedout:true
        })
    })

})

module.exports = usersRouter