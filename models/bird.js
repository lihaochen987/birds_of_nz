const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BirdSchema = new Schema({
    species: String,
    description: String,
    location: String,
    image: String,
})

module.exports = mongoose.model('Bird', BirdSchema);