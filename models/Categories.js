const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Categories = new Schema({

    name: { type: String, required:true},
    description: { type: String},
    },
    {
        timestamps: true
});

const Category = mongoose.model('categories', Categories)

module.exports = Category