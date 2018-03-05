var async = require('async');
var libs = require('../libs');
var errors = libs.errors;
var models = require('../models');

module.exports.enrichByPlateId = function (req, res, next) {
    var plate_id = req.params.plate_id;

    async.series(
        [
            //--check for param--
            function (callback) {
                if (!plate_id) {
                    errors.logAndSendError(res, null, errors.err_MissingParams, 'plate_id is required.');
                } else if (!req.user) {
                    errors.logAndSendError(res, null, errors.err_OperationNotCompleted, 'User is not available.');
                } else {
                    callback();
                }
            },

            //---find a vehicle by plate_id--
            function () {
                models.vehicle.findOne({'plate_id': plate_id}, function (err, vhc) {
                    if (err) {
                        errors.logAndSendError(res, err);
                    } else if (!vhc) {
                        errors.logAndSendError(res, null, errors.err_ResourceNotFound, 'No such vehicle found.');
                    } else {
                        req.vehicle = vhc;
                        next();
                    }
                });
            },
        ]
    );
};
