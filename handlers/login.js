var async = require('async');
var bcrypt = require('bcrypt-nodejs');
var libs = require('../libs');
var errors = libs.errors;
var social = libs.social;
var models = require('../models');

function generateTokenHash(data1, data2) {
    var buf = new Buffer(bcrypt.hashSync(data1 + ':' + data2), 'utf-8');
    return buf.toString('hex');
}

/**
 * Performs facebook login operation.
 * @param req request
 * @param res response
 */
module.exports.facebook = function (req, res) {

    //--get request fields--
    var fb_access_token = req.body.fb_access_token;

    //---required fields must be sent--
    if (!req.body || !fb_access_token) {
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
                    } else if (!user) {
                        errors.logAndSendError(res, null, errors.err_OperationNotCompleted, 'Facebook user is not registered.');
                    } else {
                        callback(null, fb_profile, user);
                    }

                });
            },

            //--save user with latest profile--
            function (fb_profile, user, callback) {
                user.fb_profile = fb_profile;
                user.save(function (err, usr) {
                    if (err) {
                        errors.logAndSendError(res, err);
                    } else {
                        callback(null, usr);
                    }
                });
            },

            //--find a token for user--
            function (user, callback) {
                models.token.findOne({'fb_id': user.fb_id}, function (err, token) {
                    if (err) {
                        errors.logAndSendError(res, err);
                    } else {
                        callback(null, token, user);
                    }
                });
            },

            //--update and save found token, create a new one if not found--
            function (token, user, callback) {
                if (token) {
                    token.timestamp = Date.now();
                } else {
                    token = new models.token({
                        'token_hash': generateTokenHash(user.fb_id, fb_access_token),
                        'fb_id': user.fb_id
                    });
                }

                token.save(function (err, tkn) {
                    if (err) {
                        errors.logAndSendError(res, err);
                    } else {
                        callback(null, tkn, user);
                    }
                });
            },
            //--update a device token for user-if not exit add new--
            function (user,callback) {
                       var deviceData={};
                       deviceData.device_token=req.body.device_token;
                       deviceData.device_type=req.body.device_type;
                       deviceData.fb_id=user.fb_id;
                        //--update device data--
                        models.device.findOneAndUpdate({device_token: req.body.device_token}, {$set: deviceData},{ upsert: true }, function (err, device) {
                           console.log('in login');
                            console.log(err);
                           if (err) {
                                      errors.logAndSendError(res, err);
                                   } 
                             });
                    
              },
            //end of device token updation
            

            //--send token and user--
            function (token, user) {
                res.send({'token': token, 'user': user});
            }

        ]
    );
};