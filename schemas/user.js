var mongoose = require('mongoose');
var validation = require('../libs').validation;

var user_schema = new mongoose.Schema({
    'fb_id': {type: Number, required: true, index: {unique: true}},
    'fb_profile': {type: mongoose.Schema.Types.Mixed, required: true},
    'ln_profile': {type: mongoose.Schema.Types.Mixed},
    'cc_number': {type: String, validate: [ validation.isValidCCNumber, 'Not a valid CC number.']},
    'mobile_number': {type: String, validate: [validation.isValidMobileNumber, 'Not a valid mobile number.']},
    'institute_id': {type: Number},
    'confirmed': {type: Boolean, default: false}
});


module.exports = user_schema;
