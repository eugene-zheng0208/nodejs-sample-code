var libs = require('../libs');
var clients = libs.config.conf_api_client.clients;
var errors = libs.errors;
var models = require('../models');

// header key names
var header_api_client_id = 'API_CLIENT_ID';
var header_api_client_key = 'API_CLIENT_KEY';
var header_authorization = 'AUTHORIZATION';


/**
 * Checks whether the request headers contain proper values for 'client_id' and 'client_key' which are required
 * to connect to our server. Values are validated against those stored in config.
 * @param req request
 * @param res response
 * @param next [optional] next callback.
 */
function checkApiCredentials(req, res, next) {

    //--let's peek into request headers---
    var client_id = req.header(header_api_client_id);
    var client_key = req.header(header_api_client_key);

    //--if not supplied--
    if (!client_id || !client_key) {
        errors.logAndSendError(res, null, errors.err_ApiCredentialsRequired);
        return;
    }

    //--assume worst--
    var isValid = false;

    //--they must exists in the api clients defined in our config--
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].api_client_id === client_id && clients[i].api_client_key === client_key) {
            isValid = true;
            break;
        }
    }

    //---let valid clients proceed, send error to the invalid ones--
    if (isValid) {
        next();
    } else {
        errors.logAndSendError(res, null, errors.err_InvalidApiCredentials);
    }
}

/**
 * Checks whether request has a valid authorization token. If token is valid, adds associated user to request.
 * @param req request.
 * @param res response.
 * @param next next callback.
 * @returns {*}
 */
function checkAuthorization(req, res, next) {

    //--look for authorization header--
    var authorization_token = req.header(header_authorization);

    //--if not authorized--
    if (!authorization_token) {
        errors.logAndSendError(res, null, errors.err_AuthorizationRequired);
        return;
    }

    //--check that token exists--
    models.token.findOneAndUpdate({'token_hash': authorization_token}, {'timestamp': Date.now()}, function (err, token) {

        //--error checking token--
        if (err) {
            errors.logAndSendError(res, err);
            return;
        }

        //--token not found--
        if (!token) {
            errors.logAndSendError(res, null, errors.err_InvalidAuthorization);
            return;
        }

        //--get user associated with token--
        models.user.findOne({'fb_id': token.fb_id}, function (err, user) {
            //--error getting user--
            if (err) {
                errors.logAndSendError(res, err);
            } else {
                req.user = user;
                next();
            }
        });

    });

}

//--exports--
module.exports.checkApiCredentials = checkApiCredentials;
module.exports.checkAuthorization = checkAuthorization;

