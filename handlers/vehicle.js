var async = require('async');
var libs = require('../libs');
var errors = libs.errors;
var files = libs.files;
var models = require('../models');

module.exports.uploadVehicleImage = function (req, res) {

    if (req.user.fb_id !== req.vehicle.user_fb_id) {
        errors.logAndSendError(res, null, errors.err_OperationNotCompleted, 'Vehicle doesn\'t belong to current user.');
        return;
    }

    var image_type = req.params.image_type;

    if (!req.files) {
        errors.logAndSendError(res, null, errors.err_InvalidParams, 'file must be attached.');
        return;
    }

    var tmp_file = null;

    //--peek the first file object--
    for (var f in req.files) {
        if (req.files.hasOwnProperty(f)) {
            tmp_file = req.files[f];
            break;
        }
    }

    //--ascertain file extension--
    var tmp_file_extension = null;
    if (tmp_file && tmp_file.name) {
        var parts = tmp_file.name.toString().split('.');
        if (parts && parts.length > 0) {
            tmp_file_extension = parts.pop();
        }
    }


    var image_url = null;
    var vehicle_img_field = null;
    async.series(
        [
            //--check for param--
            function (callback) {
                if (!image_type) {
                    errors.logAndSendError(res, null, errors.err_MissingParams, 'image_type is required.');
                } else if (!tmp_file) {
                    errors.logAndSendError(res, null, errors.err_MissingParams, 'file is required.');
                } else if (!tmp_file.name) {
                    errors.logAndSendError(res, null, errors.err_MissingParams, 'file name is required.');
                } else if (!(tmp_file_extension === 'jpeg')) {
                    errors.logAndSendError(res, null, errors.err_MissingParams, 'file should be jpeg image.');
                } else {

                    if (image_type === 'img_vehicle') {
                        vehicle_img_field = 'img_url_vehicle';
                        callback();
                    } else if (image_type === 'img_owner_slip') {
                        vehicle_img_field = 'img_url_owner_slip';
                        callback();
                    } else if (image_type === 'img_insurance') {
                        vehicle_img_field = 'img_url_insurance';
                        callback();
                    } else if (image_type === 'img_driving_license') {
                        vehicle_img_field = 'img_url_driving_license';
                        callback();
                    } else {
                        errors.logAndSendError(res, null, errors.err_OperationNotCompleted, 'Invalid image_type value.');
                    }

                }
            },

            //---copy to user's uploads dir--
            function (callback) {
                files.saveForUserVehicle(tmp_file.path, image_type + '.jpeg', req.user, req.vehicle, function (err, url) {
                    if (err) {
                        errors.logAndSendError(res, err);
                    } else {
                        image_url = url;
                        callback();
                    }
                });
            },

            //--update vehicle--
            function () {
                req.vehicle[vehicle_img_field] = image_url;
                req.vehicle.save(function (err, vhc) {
                    if (err) {
                        errors.logAndSendError(res, err);
                    } else {
                        req.vehicle = vhc;
                        res.send(req.vehicle);
                    }
                });
            }
        ]
    );
};

module.exports.getVehicle = function (req, res) {
    res.send(req.vehicle);
};

module.exports.createVehicle = function (req, res) {
    var vehicle = new models.vehicle({
        'plate_id': req.body.plate_id,
        'user_fb_id': req.user.fb_id,
        'nickname': req.body.nickname,
        'capacity': req.body.capacity,
        'brand': req.body.brand,
        'model': req.body.model
    });

    vehicle.save(function (err, vhc) {
        if (err) {
            errors.logAndSendError(res, err);
        } else {
            res.send(vhc);
        }
    });
};

module.exports.updateVehicle = function (req, res) {

    if (req.user.fb_id !== req.vehicle.user_fb_id) {
        errors.logAndSendError(res, null, errors.err_OperationNotCompleted, 'Vehicle doesn\'t belong to current user.');
        return;
    }

    req.vehicle.nickname = req.body.nickname;
    req.vehicle.capacity = req.body.capacity;
    req.vehicle.brand = req.body.brand;
    req.vehicle.model = req.body.model;

    req.vehicle.save(function (err, vhc) {
        if (err) {
            errors.logAndSendError(res, err);
        } else {
            req.vehicle = vhc;
            res.send(req.vehicle);
        }
    });
};

module.exports.deleteVehicle = function (req, res) {

    if (req.user.fb_id !== req.vehicle.user_fb_id) {
        errors.logAndSendError(res, null, errors.err_OperationNotCompleted, 'Vehicle doesn\'t belong to current user.');
        return;
    }

    //--try deleting files first--
    if (req.vehicle.img_url_vehicle) {
        files.deleteForUserVehicle(req.user, req.vehicle, req.vehicle.img_url_vehicle, function (err) {
            req.log.error(err);
        });
    }

    if (req.vehicle.img_url_owner_slip) {
        files.deleteForUserVehicle(req.user, req.vehicle, req.vehicle.img_url_owner_slip, function (err) {
            req.log.error(err);
        });
    }

    if (req.vehicle.img_url_insurance) {
        files.deleteForUserVehicle(req.user, req.vehicle, req.vehicle.img_url_insurance, function (err) {
            req.log.error(err);
        });
    }

    if (req.vehicle.img_url_driving_license) {
        files.deleteForUserVehicle(req.user, req.vehicle, req.vehicle.img_url_driving_license, function (err) {
            req.log.error(err);
        });
    }

    req.vehicle.remove(function (err) {
        if (err) {
            errors.logAndSendError(res, err);
        } else {
            res.send({'success': true});
        }
    });
};

module.exports.getUserVehicles = function (req, res) {
    models.vehicle.find({'user_fb_id': req.user.fb_id}, function (err, docs) {
        if (err) {
            errors.logAndSendError(res, err);
        } else {
            res.send(docs);
        }
    });
};