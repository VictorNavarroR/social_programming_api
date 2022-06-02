const express = require('express')
const db = require('../db')
const Tutoriales = require('../models/Tutoriales')
const isAuthenticated = require('../middlewares/auth.middleware')
const multer = require('multer')
const upload = require('../middlewares/file.middleware')


//create client route
const TutorialesRouter = express.Router()

TutorialesRouter.get('/', (req, res, next) => {

    Tutoriales.find()
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

TutorialesRouter.get('/:id', (req, res, next) => {

    const id = req.params.id

    Tutoriales.findById(id)
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

TutorialesRouter.get('/limit/:q', (req, res, next) => {

    const q = req.params.q

    Tutoriales.find().limit(q)
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})
TutorialesRouter.get('/user/:id', (req, res, next) => {

    const id = req.params.id

    Tutoriales.find({ uploaded_by: id })
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})
TutorialesRouter.get('/user/count/:id', (req, res, next) => {

    const id = req.params.id

    Tutoriales.countDocuments({ uploaded_by: id })
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

TutorialesRouter.post('/', isAuthenticated, [upload.upload.single('image'), upload.uploadToCloudinary], (req, res, next) => {

    const imagenTutorial = req.file_url ? req.file_url : undefined
    try {
    const newTutorial = new Tutoriales({
        name: req.body.name,
        category: req.body.category,
        link: req.body.link,
        image: imagenTutorial,
        isApproved: false,
        uploaded_by: req.body.uploaded_by,
    })

    return newTutorial.save()
            .then( () => {
                return res.status(201).json(newTutorial)
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

TutorialesRouter.put('/:id', isAuthenticated, [upload.upload.single('image'), upload.uploadToCloudinary], (req, res) => {
    const id = req.params.id
    
    const tutorialEdited = new Tutoriales(req.body)

    const imagenTutorial = req.file_url ? req.file_url : undefined

    tutorialEdited.image = imagenTutorial;

    tutorialEdited._id = id //reasignamos el id para sobreescribir el documento en la DB

    return Tutoriales.findByIdAndUpdate(id, tutorialEdited, { new: true })
                    .then( tutorialUpdated => {
                        return res.status(200).json(tutorialUpdated)
                    })
                    .catch( err => {
                        const error = new Error(`Ruta no editado ${err}`)
                        error.status = 405;
                        return next(error);
                })
})

TutorialesRouter.put('/approve/:id', isAuthenticated, (req, res) => {
    const id = req.params.id
    

    return Tutoriales.findByIdAndUpdate(id, { isApproved: true }, { overwrite:false })
                    .then( tutorialUpdated => {
                        return res.status(200).json(tutorialUpdated)
                    })
                    .catch( err => {
                        const error = new Error(`Tutorial no editado ${err}`)
                        error.status = 405;
                        return next(error);
                })
})

TutorialesRouter.delete('/:id', isAuthenticated,  (req, res) => {
    const id = req.params.id
    Tutoriales.findByIdAndDelete(id)
        .then( () => {
            return res.status(200).json(`El tutorial con id ${id} ha sido eliminado`)
        })
        .catch( (err) => {
            const error = new Error('ruta no encontrada')
            error.status = 405;
            return next(error);
        })
})

module.exports = TutorialesRouter;