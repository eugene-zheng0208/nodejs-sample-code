var libs = require('../libs');
var errors = libs.errors;
var models = require('../models');
var async = require('async');

module.exports.getUser = function (req, res) {
    res.send(req.user);
};

module.exports.updateUser = function (req, res) {

    var should_save = false;
    async.series([

        //---set cc and mob---
        function (callback) {
            if (req.body.cc_number) {
                req.user.cc_number = req.body.cc_number;
                should_save = true;
            }

            if (req.body.mobile_number) {

                //--strip all chars except + and 0-9--
                req.user.mobile_number = req.body.mobile_number.toString().replace(/[^\+0-9]/g, '');
                should_save = true;
            }

            callback();
        },

        //--check if institute_id exists--
        function (callback) {
            if (!req.body.institute_id) {
                callback();
            } else {
                models.institute.findOne({'institute_id': req.body.institute_id}, function (err, inst) {
                    if (err) {
                        errors.logAndSendError(res, err);
                    } else if (!inst) {
                        errors.logAndSendError(res, null, errors.err_OperationNotCompleted, 'institute_id: institute does not exists.');
                    } else {
                        req.user.institute_id = inst.institute_id;
                        should_save = true;
                        callback();
                    }
                });
            }
        },

        //--save user if needed--
        function (callback) {
            if (should_save) {
                req.user.save(function (err, user) {
                    if (err) {
                        errors.logAndSendError(res, err);
                    } else {
                        req.user = user;
                        callback();
                    }
                });
            } else {
                callback();
            }
        },

        //--reply with user--
        function () {
            res.send(req.user);
        }

    ]);


};

module.exports.confirmUser = function (req, res) {
    req.user.confirmed = true;
    req.user.save(function (err, usr) {
        if (err) {
            errors.logAndSendError(res, err);
        } else {
            res.send({'confirmed': usr.confirmed, 'user': usr});
        }
    });
};