const mongoose = require('mongoose')
const RutaVideos = require('./RutaVideos')

const Schema = mongoose.Schema

const rutasSchema = new Schema({
    name: {type:String, required:true},
    image: {type:String},
    description: {type:String, required:true},
    ruta_videos: {type:mongoose.Types.ObjectId, ref: RutaVideos}
},
{
    timestamps: true
}
)
const Rutas = mongoose.model('rutas', rutasSchema)

module.exports = Rutas