const mongoose = require('mongoose')
const Rutas = require('./Rutas')

const Schema = mongoose.Schema

const rutaVideosSchema = new Schema({

    name: { type: String, required:true},
    image: { type: String},
    description: { type: String},
    video_url: { type: String, required:true},
    likes: { type: Array},
    ruta: [{ type: mongoose.Types.ObjectId, ref: Rutas, required:true}]
    },
    {
        timestamps: true
});

const RutaVideos = mongoose.model('rutaVideos', rutaVideosSchema)

module.exports = RutaVideos