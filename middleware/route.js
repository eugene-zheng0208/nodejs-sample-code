var async = require('async');
var libs = require('../libs');
var errors = libs.errors;
var models = require('../models');

module.exports.enrichByRouteId = function (req, res, next) {

    if (!req.params.route_id) {
        errors.logAndSendError(res, errors.err_MissingParams, 'route_id');
        return;
    }

    async.waterfall(
        [
            //--find the route--
            function (cb) {
                models.route.findOne({_id: req.params.route_id}, function (err, rt) {
                    cb(err, rt);
                })
            },

            //---err if not fount, else enrich--
            function (rt, cb) {
                if (rt) {
                    req.route = rt;
                    cb();
                } else {
                    errors.logAndSendError(res, errors.err_ResourceNotFound, 'Route not found');
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