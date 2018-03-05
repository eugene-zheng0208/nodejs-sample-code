//---main resources--
var restify = require('restify');
var libs = require('./libs');
var middleware = require('./middleware');
var mongoose = require('mongoose');
var handlers = require('./handlers');

//--init db--
var mConf = libs.config.conf_mongoose;
mongoose.connect('mongodb://' + mConf.host + ':' + mConf.port + '/' + mConf.db_name);

//--init server---
var sConf = libs.config.conf_server;
var server = restify.createServer({name: sConf.name, version: sConf.version, log: libs.logger});

//--setup middleware--
server.use(middleware.authenticator.checkApiCredentials);
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser({keepExtensions: true, rejectUnknown: true}));

//---setup routes--
server.get('/', handlers.info);

server.post('/register/facebook', handlers.register.facebook);

server.post('/login/facebook', handlers.login.facebook);

server.get('institutes',
    middleware.authenticator.checkAuthorization,
    handlers.institute.getInstitutes);

server.get('/me',
    middleware.authenticator.checkAuthorization,
    handlers.me.getUser);

server.get('/me/confirm',
    middleware.authenticator.checkAuthorization,
    handlers.me.confirmUser);

server.put('/me',
    middleware.authenticator.checkAuthorization,
    handlers.me.updateUser);

server.get('/vehicles',
    middleware.authenticator.checkAuthorization,
    handlers.vehicle.getUserVehicles);

server.post('/vehicles',
    middleware.authenticator.checkAuthorization,
    handlers.vehicle.createVehicle);

server.get('/vehicles/:plate_id',
    middleware.authenticator.checkAuthorization,
    middleware.vehicle.enrichByPlateId,
    handlers.vehicle.getVehicle);

server.put('/vehicles/:plate_id',
    middleware.authenticator.checkAuthorization,
    middleware.vehicle.enrichByPlateId,
    handlers.vehicle.updateVehicle);

server.put('/vehicles/:plate_id/images/:image_type',
    middleware.authenticator.checkAuthorization,
    middleware.vehicle.enrichByPlateId,
    handlers.vehicle.uploadVehicleImage);

server.del('/vehicles/:plate_id',
    middleware.authenticator.checkAuthorization,
    middleware.vehicle.enrichByPlateId,
    handlers.vehicle.deleteVehicle);

server.get('/uploads/.*', handlers.file_serve.serveUploads);


server.post('/me/routes',
    middleware.authenticator.checkAuthorization,
    handlers.route.saveRoute);

server.get('/me/routes',
    middleware.authenticator.checkAuthorization,
    handlers.route.getUserRoutes);

server.get('/routes/:id',
    middleware.authenticator.checkAuthorization,
    handlers.route.getRoute);

server.put('/routes/:id',
    middleware.authenticator.checkAuthorization,
    handlers.route.updateRoute);

server.del('/routes/:id',
    middleware.authenticator.checkAuthorization,
    handlers.route.deleteRoute);

server.get('/routes/search/:fromlat/:fromlong/:tolat/:tolong/:radius',
    middleware.authenticator.checkAuthorization,
    handlers.route.searchRoutes);

server.post('/passenger',
    middleware.authenticator.checkAuthorization,
    handlers.routePassenger.saveRoutePassenger);

server.get('/passenger/:id',
    middleware.authenticator.checkAuthorization,
    handlers.routePassenger.getRoutePassengerById);

server.get('/routes/:id/passenger',
    middleware.authenticator.checkAuthorization,
    handlers.routePassenger.getRoutePassenger);

server.del('/passenger/:id',
    middleware.authenticator.checkAuthorization,
    handlers.routePassenger.deletePassengerRoute);

server.get('/me/devices',
    middleware.authenticator.checkAuthorization,
    handlers.device.getDevice);

//---start server---
server.listen(libs.config.conf_server.port, libs.config.conf_server.host);

//---log error that propagate to end---
server.on('after', function (req, res, route, err) {
    if (err) {
        libs.logger.error(err);
        console.log(err);
    }
});

server.on('uncaughtException', function (err) {
    if (err) {
        libs.logger.error(err);
        console.log(err);
    }
});

//--expose for testing--
module.exports = server;

//TODO--Reset Database for testing, remove on release--
server.get('/reset', require('./reset_server').reset);
