const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BirdSchema = new Schema({
    species: String,
    description: String,
    location: String,
})

module.exports = mongoose.model('Bird', BirdSchema);