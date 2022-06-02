const express = require('express')
const db = require('../db')
const Pages = require('../models/Pages')
const multer = require('multer')
const upload = require('../middlewares/file.middleware')
const isAuthenticated = require('../middlewares/auth.middleware')


//create client route
const PagesRouter = express.Router()

PagesRouter.get('/', (req, res, next) => {

    Pages.find()
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})
PagesRouter.get('/limit/:q', (req, res, next) => {

    const q = req.params.q

    Pages.find().limit(q).sort({'createdAt': -1})
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

PagesRouter.get('/:id', (req, res, next) => {

    const id = req.params.id

    Pages.findById(id)
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

PagesRouter.get('/user/count/:id', (req, res, next) => {

    const id = req.params.id

    Pages.countDocuments({ uploaded_by: id })
        .then( ruta => {
            return res.status(200).json(ruta);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

PagesRouter.post('/',  isAuthenticated, [upload.upload.single('image'), upload.uploadToCloudinary], async (req, res, next) => {
    try {
    const imagePage = req.file_url ? req.file_url : undefined
    const newPage = new Pages({
        title: req.body.title,
        slug: req.body.slug,
        excerpt: req.body.excerpt,
        image: imagePage,
        content: req.body.content,
        category: req.body.category ? req.body.category : 'Sin categoría',
        created_by: req.body.created_by,
        type: req.body.type
    })

    return newPage.save()
            .then( () => {
                return res.status(201).json(newPage)
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

PagesRouter.put('/:id', isAuthenticated,  [upload.upload.single('image'), upload.uploadToCloudinary], async(req, res) => {
    const id = req.params.id
    
    const pageEdited = new Pages(req.body)
    pageEdited.image = req.file_url ? req.file_url : undefined

    pageEdited._id = id //reasignamos el id para sobreescribir el documento en la DB

    return Pages.findByIdAndUpdate(id, pageEdited, { new: true })
                    .then( pageUpdated => {
                        return res.status(200).json(pageUpdated)
                    })
                    .catch( err => {
                        const error = new Error(`Page no editado ${err}`)
                        error.status = 405;
                        return next(error);
                })
})

PagesRouter.delete('/:id', (req, res) => {
    const id = req.params.id
    Pages.findByIdAndDelete(id)
        .then( () => {
            return res.status(200).json(`La ruta con id ${id} ha sido eliminado`)
        })
        .catch( (err) => {
            const error = new Error('ruta no encontrada')
            error.status = 405;
            return next(error);
        })
})

module.exports = PagesRouter;