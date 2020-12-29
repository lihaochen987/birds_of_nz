const Joi = require ('joi');
const { number } = require('joi');

module.exports.birdSchema = Joi.object({
    bird: Joi.object({
        species: Joi.string().required(),
        description: Joi.string().required(),
        // image: Joi.string().required(),
        location: Joi.string().required(),
    }).required()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().required()
    }).required()
})