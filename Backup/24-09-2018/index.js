var admin = require('firebase-admin');

var schedule = require('node-schedule');

const logger = require('./config/logging');



var count=0;



var serviceAccount = require('./ServiceAccountKey/quicklift-e8e39-firebase-adminsdk-rdkx6-a2e0c82785.json');



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



var DriversWorking = db.ref("DriversWorking/Car");

var DriversAvailable = db.ref("DriversAvailable/Car");

var refCustomerRequests = db.ref("CustomerRequests");

var DriversData=[];





// Attach an asynchronous callback to read the data at our CustomerRequests reference

refCustomerRequests.on("child_added", function(snapshotrec,prevChildKey) {

	

		

			logger.info( 'Incoming trip from: '+snapshotrec.key);
			
  

				console.log("driver id: " + snapshotrec.key);

  

  

			var refDriver = db.ref("Drivers/"+snapshotrec.key);

			  refDriver.once("value", function(snapshot) {

				 

				  var device_token=snapshot.child("device_token").val();

				  if(device_token!=null)

				  {

					 snapshotrec.forEach(function(childrec) {

						 

						logger.info('Incoming trip data='+JSON.stringify(childrec.val()));

						

						var message={

							 

								"token":device_token,

								/* "notification":{

								  "title":"CustomerRequests coming from firebase function",

								  "body":"Works..wow!! from firebase function on CustomerRequests table insert "

								},*/



								"data" : {

								  "type" : "customer_request",

								  "data":JSON.stringify(childrec.val())

								},

								"android":{

								  "priority":"high"

								}

								};



					  // Send a message to the device corresponding to the provided

					admin.messaging().send(message)

					  .then((response) => {

						// Response is a message ID string.

						logger.info( 'Successfully sent customer_request message to: '+snapshotrec.key);

						console.log('Successfully sent customer_request message:', response);

					  })

					  .catch((error) => {

						 logger.info( 'Error sending customer_request message to: '+snapshotrec.key+' Error: '+error);

						console.log('Error sending customer_request message:', error);

					  });

					  

					 });

					  

					  

				  }

				 

			  });

			  

			  

}, function (errorObject) {

  console.log("The read failed: " + errorObject.code);

});





// Get the data on a CustomerRequests that has been removed

refCustomerRequests.on("child_removed", function(snapshotrec) {

	console.log("removed request");

console.log("driver id: " + snapshotrec.key);

		logger.info( 'Trip cancelled to: '+snapshotrec.key);

  

			var refDriver = db.ref("Drivers/"+snapshotrec.key);

			  refDriver.once("value", function(snapshot) {

				 

				  var device_token=snapshot.child("device_token").val();

				  if(device_token!=null)

				  {

					 snapshotrec.forEach(function(childrec) {

						 

						

						

						var message={

							 

								"token":device_token,

								/* "notification":{

								  "title":"CustomerRequests coming from firebase function",

								  "body":"Works..wow!! from firebase function on CustomerRequests table insert "

								},*/



								"data" : {

								  "type" : "request_cancelled",

								  "data":JSON.stringify(childrec.val())

								},

								"android":{

								  "priority":"high"

								}

								};



					  // Send a message to the device corresponding to the provided

					admin.messaging().send(message)

					  .then((response) => {

						// Response is a message ID string.

						console.log('Successfully sent message:', response);

						logger.info( 'Successfully sent cancel_request message to '+snapshotrec.key+': '+ response);

					  })

					  .catch((error) => {

						console.log('Error sending message:', error);

						 logger.info( 'Error sending cancel_request message to '+snapshotrec.key+': '+ error);

					  });

					 });

					  

					  

				  }

				 

			  });

  //console.log("The blog post titled '" + deletedPost.title + "' has been deleted");

});

  



var j = schedule.scheduleJob('*/10 * * * * *', function(){

  console.log('scheduleJob running every 2 secs');

  DriversData=[];

  

  DriversWorking.once("value", function(snapshot) {

	//console.log(snapshot.val());

	snapshot.forEach(function(child) {

		//console.log(child.key);

		DriversData.push(child.key)

	})

	

	

	DriversAvailable.once("value", function(driversAvailableSnapshot) {

	//console.log(driversAvailableSnapshot.val());

	driversAvailableSnapshot.forEach(function(driversAvailableChild) {

		//console.log(driversAvailableChild.key);

		DriversData.push(driversAvailableChild.key)

	})

	

	

	//console.log(DriversData);

	DriversData.forEach(function(eachDriver){

		var refDrivers = db.ref("Drivers/"+eachDriver).child('device_token');

		

		refDrivers.once("value", function(snapshot) {

		//console.log(snapshot.val());

  

  

       

		 var device_token=snapshot.val();

		 if(device_token!=null)

		 {

			  console.log(eachDriver);

			 device_tokens.push(device_token);

			

			//message not in use

			 var message={

						

					   // "topic":topic,

						"token":device_token,

						"data" : {

						  "type" : "getLocation",

						  

						},

						/*"notification":{

						  "title":"Testing location notification ",

						  "body":"getLocation type notification "

						},*/

						"android":{

						  "priority":"high"

						  

						}};

						

						

						var payload = {

							  /*notification: {

								title: "Testing location notification",

								body: "getLocation type notification"

							  },*/

							  

							  data: {

								type: "getLocation",

								

							  }

							};



					 var options = {

					  priority: "high",

					  timeToLive:10

					};

						

						// Send a message to the device corresponding to the provided

						admin.messaging().send(message)

					  .then((response) => {

						// Response is a message ID string.

						logger.info( 'Successfully sent getLocation message to '+eachDriver+': '+ response);

					console.log('Successfully sent message to '+eachDriver+':', response);

						//console.log(response.failureCount);

					/*	if(response.failureCount>0)

						{

						 var errorVar=response.results[0].error;

						 var errorCode=JSON.parse(JSON.stringify(errorVar)).code;

						 if(errorCode=="messaging/registration-token-not-registered")

						{

							// remove driver from DriversAvailable if app is uninstalled

						//	var driveravailableCar= db.ref("DriversAvailable/Car/"+eachDriver);

						//	driveravailableCar.remove();

						//	var	driversWorking=db.ref("DriversWorking/Car/"+eachDriver);

						//	driversWorking.remove();

 

						}

						}*/

						

					  })

					  .catch((error) => {

						  logger.info( 'Error sending getLocation message to '+eachDriver+': '+ error);

						console.log('Error sending message:', error);

						

					  });

		 }

      

}, function (errorObject) {

  console.log("The read failed: " + errorObject.code);

});

		

		

	});

	

});



});



  

});

