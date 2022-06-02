const express = require('express')
const db = require('../db')
const RutaVideos = require('../models/RutaVideos')
const isAuthenticated = require('../middlewares/auth.middleware')
const multer = require('multer')
const upload = require('../middlewares/file.middleware')

const RutaVideosRouter = express.Router()

RutaVideosRouter.get('/', (req, res, next) => {

    RutaVideos.find()
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})
RutaVideosRouter.get('/ruta/:id', (req, res, next) => {

    const id = req.params.id
    console.log(id)
    RutaVideos.find().where('ruta').in(id)
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

RutaVideosRouter.get('/video/:id', (req, res, next) => {

    const id = req.params.id

    RutaVideos.find({ _id: id })
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})
RutaVideosRouter.get('/user/count/:id', (req, res, next) => {

    const id = req.params.id

    RutaVideos.countDocuments({ uploaded_by: id })
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

RutaVideosRouter.post('/', isAuthenticated, [upload.upload.single('image'), upload.uploadToCloudinary], (req, res, next) => {

    const imageVideo = req.file_url ? req.file_url : undefined
    try {
    const newRutaVideo = new RutaVideos({
        name: req.body.name,
        image: imageVideo,
        description: req.body.description,
        video_url: req.body.video_url,
        likes: req.body.likes,
        ruta: req.body.ruta,
    })

    return newRutaVideo.save()
            .then( () => {
                return res.status(201).json(newRutaVideo)
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

RutaVideosRouter.put('/:id', isAuthenticated, (req, res) => {
    const id = req.params.id
    
    const rutaVideoEdited = new RutaVideos(req.body)

    rutaVideoEdited._id = id //reasignamos el id para sobreescribir el documento en la DB

    return RutaVideos.findByIdAndUpdate(id, rutaVideoEdited, { new: true })
                    .then( rutaVideoUpdated => {
                        return res.status(200).json(rutaVideoUpdated)
                    })
                    .catch( err => {
                        const error = new Error(`Video no editado ${err}`)
                        error.status = 405;
                        return next(error);
                })
})

RutaVideosRouter.put('/like/:id', isAuthenticated, (req, res) => {
    const id = req.params.id
    

    return RutaVideos.findByIdAndUpdate(id,
                { $addToSet: { likes: req.body.likes } })
                    .then( rutaVideoUpdated => {
                        return res.status(200).json(rutaVideoUpdated)
                    })
                    .catch( err => {
                        const error = new Error(`Video no editado ${err}`)
                        error.status = 405;
                        return next(error);
                })
})

RutaVideosRouter.delete('/:id', isAuthenticated,  (req, res) => {
    const id = req.params.id
    RutaVideos.findByIdAndDelete(id)
        .then( () => {
            return res.status(200).json(`El video con id ${id} ha sido eliminado`)
        })
        .catch( (err) => {
            const error = new Error('ruta no encontrada')
            error.status = 405;
            return next(error);
        })
})

module.exports = RutaVideosRouter;