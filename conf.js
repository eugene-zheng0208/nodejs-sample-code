/**
 * This is the default configuration file for app. All settings use default or development values.
 *
 * For production use, another conf file, with production settings, should be placed at the path
 * indicated by 'conf_external_path'. If such file is found, it will be used instead of this file.
 *
 * @type {{conf_external_path: string, conf_mongoose: {host: string, port: number, db_name: string}, conf_server: {name: string, version: string, host: string, port: number}, conf_token: {expireAfterSeconds: number}, conf_api_client: {clients: *[]}}}
 */
module.exports = {

    // Production conf file path.
    conf_external_path: '/etc/node.conf/carpool_service_app.js',

    // Log settings
    conf_log: {
        name: 'carpool_service_log',
        console: true,
        log_file: __dirname + '/log/app.log'
    },

    // MongoDB settings.
    conf_mongoose: {
        host: 'localhost',
        port: 27017,
        db_name: 'carpool_service'
    },


    // Server settings.
    conf_server: {
        name: 'Mi Aguila carpool web service',
        version: '0.0.1',
        host: '127.0.0.1',
        port: 8080
    },

    // Files
    conf_files: {
        uploadDir: __dirname + '/uploads'
    },

    // Auth Token expiry time in seconds.
    conf_token: {
        expireAfterSeconds: 604800
    }

    
};
