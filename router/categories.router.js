const express = require('express')
const db = require('../db')
const Categories = require('../models/Categories')
const multer = require('multer')
const upload = require('../middlewares/file.middleware')


//create client route
const CategoriesRouter = express.Router()

CategoriesRouter.get('/', (req, res, next) => {

    Categories.find()
        .then( categoria => {
            return res.status(200).json(categoria);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})
CategoriesRouter.get('/limit/:q', (req, res, next) => {

    const q = req.params.q

    Categories.find().limit(q).sort({'createdAt': -1})
        .then( categoria => {
            return res.status(200).json(categoria);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

CategoriesRouter.get('/categoria/count/:id', (req, res, next) => {

    const id = req.params.id

    Categories.countDocuments({ uploaded_by: id })
        .then( categoria => {
            return res.status(200).json(categoria);
        })
        .catch( err => {
            const error = new Error(err)
            error.status = 500
            return next(error)
        })


})

CategoriesRouter.post('/', (req, res, next) => {
    try {
    const newCategoria = new Categories({
        name: req.body.name,
        description: req.body.description,

    })

    return newCategoria.save()
            .then( () => {
                return res.status(201).json(newCategoria)
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

CategoriesRouter.put('/:id', (req, res) => {
    const id = req.params.id
    
    const categoriaEdited = new Categories(req.body)

    categoriaEdited._id = id //reasignamos el id para sobreescribir el documento en la DB

    return Categories.findByIdAndUpdate(id, categoriaEdited, { new: true })
                    .then( categoriaUpdated => {
                        return res.status(200).json(categoriaUpdated)
                    })
                    .catch( err => {
                        const error = new Error(`Categoria no editado ${err}`)
                        error.status = 405;
                        return next(error);
                })
})

CategoriesRouter.delete('/', (req, res) => {
    const id = req.params.id
    Categories.findByIdAndDelete(id)
        .then( () => {
            return res.status(200).json(`La categoria con id ${id} ha sido eliminado`)
        })
        .catch( (err) => {
            const error = new Error('categoria no encontrada')
            error.status = 405;
            return next(error);
        })
})

module.exports = CategoriesRouter;