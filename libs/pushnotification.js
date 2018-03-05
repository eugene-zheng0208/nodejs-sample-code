var restify = require('restify');
var libs = require('../libs');
var async = require('async');
var models = require('../models');
var apnagent = require('apnagent');
var gcm = require('node-gcm');
var conf_pushnotification = require('../libs').config.conf_api_pushnotification;

//setting android notification cofiguration
var androidApiKey = conf_pushnotification.gcm.apiKey;
var sender = new gcm.Sender(androidApiKey);



 function androidNotification(registrationId,message,callback){
	     var registrationIds = [];
             registrationIds.push(registrationId);
        // create a message with with object values
        var message = new gcm.Message({
            collapseKey: 'Carpooling App',
            delayWhileIdle: true,
            timeToLive: 3,
            data: message
        });
       
        /**
         * Params: message-literal, registrationIds-array, No. of retries, callback-function
         **/
        sender.send(message, registrationIds, 4, function (err, result) {
              callback(err,result);
        });
    };
    


//apn notification sending
function apnNotification(iphone_token, message, callback) {
   
      var agent = new apnagent.Agent();

  // configure agent
  agent 
    .set('cert file', conf_pushnotification.apn.connection.cert)
    .set('key file', conf_pushnotification.apn.connection.key)
    .enable('sandbox');
    
     // common settings
  agent
    .set('expires', conf_pushnotification.apn.connection.expires)
    .set('reconnect delay', conf_pushnotification.apn.connection.delay)
    .set('cache ttl', conf_pushnotification.apn.connection.cachettl);

  // see error mitigation section
  agent.on('message:error', function (err, msg) {
    callback(err);
  });

  // connect needed to start message processing
  agent.connect(function (err) {
    if (err) throw err;
  });
  
  var alert = message
    , token = iphone_token;
    
    
    agent.createMessage()
    .device(token)
    .alert(alert)
    .send(function (err) {
      // handle apnagent custom errors
      if (err && err.toJSON) {
        callback({ error: err.toJSON(false) });
      } 

      // handle anything else (not likely)
      else if (err) {
       callback(err.message);
      }

      // it was a success
      else {
         callback(null,"{ success: true }");
      }
    });
    
};


//function to get devices
  function getNotifyUsers(users){
           var notifyuser=[];                
           notifyuser=users.map(function(user) {
                   return notifyuser.push=user.fb_id;
                  });
           return notifyuser;
   };


function sendNotification(dev,cb){
                         var result = {};
                       
                        if (dev.device_type.toLowerCase() == 'iphone') {
                             apnNotification(dev.device_token,dev.device_message,
                                     function(error,rslt){
                                         result.err = error;
                                         result.res = rslt;
                                          cb(null,result);
                                     }
                                );
                          }else if (dev.device_type.toLowerCase() == 'android') {
                             androidNotification(dev.device_token,dev.device_message,
                                function(error,rslt){
                                   result.err = error;
                                   result.res = rslt;
                                   cb(null,result);
                                }
                             );
                              
                          }else{
                             cb(null,null);
                          }
               
     }
                       
 
 
   
module.exports.sendPushnotification=function (users,message,callback) {
  var notifyusers=getNotifyUsers(users);
  
  models.device.find({'fb_id': { $in: [notifyusers]}}, function(err, devices){
                            var notifydevices=[];     
                           for (i=0 ;  i < devices.length; i++){
                             var tempdev={};
                             tempdev.device_type=devices[i].device_type;
                             tempdev.device_token=devices[i].device_token;
                             tempdev.fb_id=devices[i].fb_id;
                             tempdev.device_message={};
                             tempdev.device_message=message;
                             notifydevices[i]=tempdev;
                            }
                         async.map(notifydevices,sendNotification,function(err,results){
                              callback(err,results);
                           });
        });
       
  
             
 };


  

   
     
   
    
