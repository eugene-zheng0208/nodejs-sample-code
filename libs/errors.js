//---------------------------------------------------API----------------------------------------------------------------
module.exports.err_ApiCredentialsRequired = {
    http_code: 401,
    err_code: 100,
    message: 'API credentials are required to access the service.'
};

module.exports.err_InvalidApiCredentials = {
    http_code: 401,
    err_code: 101,
    message: 'API credentials are invalid.'
};

//---------------------------------------------------AUTH---------------------------------------------------------------
module.exports.err_AuthorizationRequired = {
    http_code: 401,
    err_code: 102,
    message: 'Authorization is required to access the service.'
};

module.exports.err_InvalidAuthorization = {
    http_code: 401,
    err_code: 103,
    message: 'Authorization is invalid.'
};

//---------------------------------------------------RESOURCE-----------------------------------------------------------
module.exports.err_ResourceNotFound = {
    http_code: 404,
    err_code: 104,
    message: 'The requested URL resource does not exists.'
};

//---------------------------------------------------OPERATION----------------------------------------------------------
module.exports.err_OperationNotCompleted = {
    http_code: 500,
    err_code: 105,
    message: 'The requested operation could not be completed.'
};

//---------------------------------------------------PARAMS-------------------------------------------------------------
module.exports.err_MissingParams = {
    http_code: 400,
    err_code: 106,
    message: 'Required parameters are missing from request.'
};

module.exports.err_InvalidParams = {
    http_code: 400,
    err_code: 107,
    message: 'One or more supplied parameters are invalid.'
};

//-------------------------------------send------------------------------------------------
module.exports.logAndSendError = function (res, err, api_error, additional_info) {

    if (err) {
        res.log.error(err);
    }

    if (!api_error) {
        if (err.name && err.name === 'ValidationError') {
            api_error = module.exports.err_InvalidParams;
            if (err.errors) {
                additional_info = '';
                for (var e in err.errors) {
                    if (err.errors.hasOwnProperty(e)) {
                        additional_info = additional_info + '; ' + err.errors[e].path + ': ' + err.errors[e].message;
                    }
                }
            }
        } else if (err.name && err.name === 'MongoError' && err.code && err.code === 11000) {
            api_error = module.exports.err_InvalidParams;
            additional_info = 'Already exists.';
        }
    }


    if (api_error) {
        res.send(api_error.http_code || 500,
            {
                'code': api_error.err_code || 500,
                'message': (api_error.message || 'Internal server error.') + (additional_info ? ' ' + additional_info : '')
            }
        );
    } else {
        res.send(500,
            {
                'code': 500,
                'message': 'Internal server error.' + (additional_info ? ' ' + additional_info : '')
            }
        );
    }
};