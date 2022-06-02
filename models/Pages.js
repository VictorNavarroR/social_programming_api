const mongoose = require('mongoose')
const User = require('./Users')

const Schema = mongoose.Schema

const pagesSchema = new Schema({

    title: { type: String, required:true},
    slug: { type: String, required:true},
    excerpt: { type: String},
    image: { type: String},
    content: { type: String},
    category: { type: String},
    created_by: [{ type: mongoose.Types.ObjectId, ref: User, required:true}],
    type: { type: String},
    },
    {
        timestamps: true
});

const Pages = mongoose.model('pages', pagesSchema)

module.exports = Pages