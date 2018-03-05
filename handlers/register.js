var async = require('async');
var libs = require('../libs');
var errors = libs.errors;
var social = libs.social;
var models = require('../models');

/**
 * Performs user registration through facebook. Calls login as well if successful.
 * @param req request
 * @param res response
 */
module.exports.facebook = function (req, res) {

    //--get request fields--
    var fb_access_token = req.body.fb_access_token;

    //---required fields must be sent--
    if (!fb_access_token) {
        errors.logAndSendError(res, null, errors.err_MissingParams, 'fb_access_token is required.');
        return;
    }

    //--run method chain--
    async.waterfall(
        [
            //--get social profile--
            function (callback) {
                social.facebook.getUserProfile(fb_access_token, function (err, fb_profile) {

                    if (err) {
                        errors.logAndSendError(res, err);
                    } else if (!fb_profile) {
                        errors.logAndSendError(res, null, errors.err_OperationNotCompleted, 'Could not get facebook profile.');
                    } else if (!fb_profile.email) {
                        errors.logAndSendError(res, null, errors.err_OperationNotCompleted, 'Facebook email is required.');
                   /*change the friend count to 0 for the development
                   } else if (!fb_profile.friend_count || isNaN(fb_profile.friend_count) || fb_profile.friend_count < 50) {
                        errors.logAndSendError(res, null, errors.err_OperationNotCompleted, 'User must have at least 0 facebook friends');
                        */
                    } else {
                        callback(null, fb_profile);
                    }
                });
            },

            //--check if fb id exists--
            function (fb_profile, callback) {

                models.user.findOne({'fb_id': fb_profile.uid}, function (err, user) {

                    if (err) {
                        errors.logAndSendError(res, err);
                    } else if (user && user.confirmed) {
                        errors.logAndSendError(res, null, errors.err_OperationNotCompleted, 'User is already registered.');
                    } else {
                        callback(null, fb_profile, user);
                    }

                });
            },

            //--clean vehicles of unconfirmed user--
            function (fb_profile, user, callback) {
                if (user) {
                    models.vehicle.remove({'user_fb_id': user.fb_id}, function (err) {
                        if (err) {
                            errors.logAndSendError(res, err);
                        } else {
                            callback(null, fb_profile, user);
                        }
                    });
                } else {
                    callback(null, fb_profile, user);
                }
            },

            //--create a user from profile--
            function (fb_profile, user, callback) {

                //--save/update user data--
                if (user) {
                    user.fb_id = fb_profile.uid;
                    user.fb_profile = fb_profile;
                } else {
                    user = new models.user({
                        'fb_id': fb_profile.uid,
                        'fb_profile': fb_profile
                    });
                }

                user.save(function (err, user) {
                    if (err) {
                        errors.logAndSendError(res, err);
                    } else {
                        require('./login').facebook(req, res);
                    }
                });
            }


        ]
    );
};
