const express = require('express')
const db = require('../db')
const Rutas = require('../models/Rutas')
const multer = require('multer')
const upload = require('../middlewares/file.middleware')
const isAuthenticated = require('../middlewares/auth.middleware')


//create client route
const RutasRouter = express.Router()

RutasRouter.get('/', (req, res, next) => {

    Rutas.find()
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})
RutasRouter.get('/:id', (req, res, next) => {

    const id = req.params.id

    Rutas.findById(id)
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})
RutasRouter.get('/limit/:q', (req, res, next) => {

    const q = req.params.q

    Rutas.find().limit(q).sort({'createdAt': -1})
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

RutasRouter.get('/user/count/:id', (req, res, next) => {

    const id = req.params.id

    Rutas.countDocuments({ uploaded_by: id })
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

RutasRouter.post('/',  isAuthenticated, [upload.upload.single('image'), upload.uploadToCloudinary], async (req, res, next) => {
    try {
    const imagenRuta = req.file_url ? req.file_url : undefined

    const newRuta = new Rutas({
        name: req.body.name,
        image: imagenRuta,
        description: req.body.description,
        ruta_videos: req.body.ruta_videos,
    })

    return newRuta.save()
            .then( () => {
                Rutas.find().then( ruta => {
                    return res.status(200).json(ruta);
                })
            })
            .catch( err => {
                const error = new Error(err)
                error.status = 500
                return next(error)
            })

        } catch (error) {
            next(error);
        }
    
})

RutasRouter.put('/:id', isAuthenticated,  [upload.upload.single('image'), upload.uploadToCloudinary], async(req, res) => {
    const id = req.params.id
    
    const rutaEdited = new Rutas(req.body)
    rutaEdited.image = req.file_url ? req.file_url : undefined

    rutaEdited._id = id //reasignamos el id para sobreescribir el documento en la DB

    return Rutas.findByIdAndUpdate(id, rutaEdited, { new: true })
                    .then( rutaUpdated => {
                        return res.status(200).json(rutaUpdated)
                    })
                    .catch( err => {
                        const error = new Error(`Ruta no editada ${err}`)
                        error.status = 405;
                        return next(error);
                })
})


RutasRouter.delete('/:id', isAuthenticated, (req, res) => {
    const id = req.params.id
    Rutas.findByIdAndDelete(id)
        .then( () => {
            Rutas.find().then( ruta => {
                return res.status(200).json(ruta);
            })
            .catch( err => {
                const error = new Error(err)
                error.status = 500
                return next(error)
            })
        })
        .catch( (err) => {
            const error = new Error('ruta no encontrada')
            error.status = 405;
            return next(error);
        })
})

module.exports = RutasRouter;