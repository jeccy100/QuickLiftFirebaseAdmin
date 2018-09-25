var admin = require('firebase-admin');
var schedule = require('node-schedule');
 

var serviceAccount = require('./ServiceAccountKey/quicklift-e8e39-firebase-adminsdk-rdkx6-350c83d0ab.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quicklift-e8e39.firebaseio.com'
});

// This registration token comes from the client FCM SDKs.
var registrationToken = 'dVlcW3ysswg:APA91bEebjYaNfJPE0bMn_9ziklpgaFGZcbmNSKK3rAIYdGOeQ2qgXbRFevUSnOrwU0_hRtpdF7p09mLBDYWW3YYxcCq3VmhaIDDySFyfTAwARC6whmZ6UUTvILwOcwuoRxYmILc2cEm';
var topic = 'Driver';
var device_tokens=[];




  // Get a database reference to our posts
var db = admin.database();
var ref = db.ref("Drivers");



  

var j = schedule.scheduleJob('/2 * * * * *', function(){
  console.log('scheduleJob running every 2 secs');
  
  
  // Attach an asynchronous callback to read the data at our Driver reference
ref.once("value", function(snapshot) {
  //console.log(snapshot.val());
  
  snapshot.forEach(function(child) {
        //console.log(child.key);
		 var device_token=child.child("device_token").val()
		 if(device_token!=null)
		 {
			 device_tokens.push(device_token);
			 
			 var message={
						
					   // "topic":topic,
						"token":device_token,
						"data" : {
						  "type" : "getLocation",
						  
						},
					/*	"notification":{
						  "title":"Testing location notification ",
						  "body":"getLocation type notification "
						},*/
						"android":{
						  "priority":"high"
						}};
						
						
						// Send a message to the device corresponding to the provided
						admin.messaging().send(message)
					  .then((response) => {
						// Response is a message ID string.
						console.log('Successfully sent message:', response);
					  })
					  .catch((error) => {
						console.log('Error sending message:', error);
					  });
		 }
      });
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});
  
});
