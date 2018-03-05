var mongoose = require('mongoose');
var validation = require('../libs').validation;

module.exports = new mongoose.Schema({
    'plate_id': {type: String, required: true, index: {unique: true}, validate: [validation.isValidVehiclePlate, 'Not a valid vehicle plate number']},
    'user_fb_id': {type: Number, required: true, index: true},
    'nickname': {type: String, required: true},
    'capacity': {type: Number, required: true, min: 1},
    'brand': {type: String},
    'model': {type: Number, required: true},
    'img_url_vehicle': {type: String},
    'img_url_owner_slip': {type: String},
    'img_url_insurance': {type: String},
    'img_url_driving_license': {type: String}
});