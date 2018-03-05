var config = require('./config');
var bunyan = require('bunyan');
var fse = require('fs-extra');

function initLogFile() {
    fse.createFileSync(config.conf_log.log_file);
    return config.conf_log.log_file;
}

module.exports = bunyan.createLogger(
    {
        name: config.conf_log.name,
        streams: [
            {stream: process.stdout, level: 'info'},
            {type: 'rotating-file', 'period': '1d', 'count': 3, path: initLogFile(), level: 'debug'}
        ],
        serializers: {
            req: bunyan.stdSerializers.req,
            res: bunyan.stdSerializers.res
        }
    }
);




