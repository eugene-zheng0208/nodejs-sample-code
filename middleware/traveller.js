var async = require('async');
var libs = require('../libs');
var errors = libs.errors;
var models = require('../models');

module.exports.enrichByCurrentUser = function (req, res, next) {

    if (!req.user) {
        errors.logAndSendError(res, 'User is required.');
        return;
    }

    async.waterfall(
        [
            //--find an active traveller--
            function (cb) {
                models.traveller.findOne({user_id: req.user._id, status: {$in: ['ready', 'checked_in']}}, function (err, trv) {
                    cb(err, trv);
                })
            },

            //---err if not fount, else enrich--
            function (trv, cb) {
                if (trv) {
                    req.traveller = trv;
                    cb();
                } else {
                    errors.logAndSendError(res, errors.err_ResourceNotFound, 'User is not an active traveller.');
                }
            }
        ],

        function (err) {
            if (err) {
                errors.logAndSendError(res, err);
            } else {
                next();
            }
        }
    );
};