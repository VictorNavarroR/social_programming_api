const mongoose = require('mongoose')

const Schema = mongoose.Schema

//Admin  lvl3 - Colaborador lvl2 - estudiante lvl1

const userRolSchema = new Schema({

    name: { type: String, required:true},
    level: { type: Number, required:true},
    },
    {
        timestamps: true
});

const UserRol = mongoose.model('userRol', userRolSchema)

module.exports = UserRol