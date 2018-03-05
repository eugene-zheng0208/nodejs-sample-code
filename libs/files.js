var fse = require('fs-extra');
var async = require('async');
var libs = require('../libs');
var uploadsDir = libs.config.conf_files.uploadDir;
var errors = libs.errors;

module.exports.saveForUserVehicle = function (path, name, user, vehicle, callback) {

    var dest_dir = uploadsDir + '/' + user._id + '/' + vehicle._id;
    var dest_path = dest_dir + '/' + name;


    async.series([

        //--ensure user's uploads dir exists--
        function (cb) {
            fse.mkdirs(dest_dir, cb);
        },

        //--copy file there--
        function (cb) {
            fse.copy(path, dest_path, cb);
        },
    ],
        //--reply with
        function (err) {
            callback(err, 'uploads' + '/' + user._id + '/' + vehicle._id + '/' + name);
        }
    );
};
module.exports.deleteForUserVehicle = function (user, vehicle, url, callback) {

    var parts = url.split('/');
    if (parts.length > 0) {
        var path = uploadsDir + '/' + user._id + '/' + vehicle._id + '/' + parts[parts.length - 1];
        fse.remove(path, callback);

    } else {
        callback(new Error('url must have, at least, file name.'));
    }
};