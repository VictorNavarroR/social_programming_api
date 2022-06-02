const mongoose = require('mongoose')
const User = require('./Users')

const Schema = mongoose.Schema

const tutorialsSchema = new Schema({

    name: { type: String, required:true},
    category: { type: Array, required:true},
    link: { type: String},
    image: { type: String},
    isApproved: { type: Boolean},
    uploaded_by: [{ type: mongoose.Types.ObjectId, ref: User, required:true}]
    },
    {
        timestamps: true
});

const Tutorials = mongoose.model('tutorials', tutorialsSchema)

module.exports = Tutorials