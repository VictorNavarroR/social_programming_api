const mongoose = require('mongoose')
const UserRol = require('./UserRols')
const Rutas = require('./Rutas')

const Schema = mongoose.Schema

const userSchema = new Schema({

    name: { type: String, required:true},
    lastName: { type: String, required:true},
    userName: { type: String },
    email: { type: String, required:true }, 
    password: { type: String, required:true},
    image: { type: String },
    googleId: { type: String },
    facebookId: { type: String },
    user_rol: [{ type: mongoose.Types.ObjectId, ref: UserRol, required:true}],
    user_paths: [{ type: mongoose.Types.ObjectId, ref: Rutas, required:true}],
    refreshToken: { type: String },
    watching:{ type: Array },
    },
    {
        timestamps: true
});

const User = mongoose.model('users', userSchema)

module.exports = User