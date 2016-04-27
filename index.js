// External Requires
var express = require("express");							// Express
var request = require("request");							//	For requesting from Google APIs
var bodyParser = require('body-parser');					// For reading Google API's JSON reply
var ejsLayouts = require("express-ejs-layouts");		// For building htmls to serve
var mongoose = require('mongoose');							// For accessing the mongoDB
var async = require('async');									// For doing multiple API calls
var session = require('express-session');					// For keeping a user session
var app = express();												// App

var City = require('./models/city.js');							// City constructor
var Neighborhood = require('./models/neighborhood.js');		// Neighborhood constructor
var User = require('./models/user.js');							// User constructor

var testCtrl = require("./controllers/test");		// Test Controller, throw away code
var authCtrl = require("./controllers/auth");		// Login and Signup Controller

// Middleware
app.set('view engine', 'ejs');								// For building htmls to serve
app.use(ejsLayouts);												// For building htmls to serve
app.use(express.static(__dirname + '/views'));			// Set static directory
app.use(bodyParser.urlencoded({extended: false}));		// Body Parser, less options
app.use(bodyParser.json());									// Body Parser, reading google's JSON replies

app.use(session({
	secret: 'isadalawatatlo',
	resave: false,
	saveUninitialized: true
}));

app.use(function(req, res, next){
	console.log("accessing middleware");
	console.log(req.session.user);
	if(req.session.user) {
		User.find({email: req.session.user}, function(user){
			req.currentUser = user;
			res.locals.currentUser = user;
			next();
		});
	}
	else {
		console.log("middleware else case");
		next();
	}
});

mongoose.connect('mongodb://localhost/project2-myneighborhood');

// Constants
var GOOGLEPLACESAPI = "https://maps.googleapis.com/maps/api/place/nearbysearch/";
var GOOGLEPLACESOUTPUT = "json";
var RADIUS = 800;

var allTypes = ["bank", "grocery_or_supermarket", "post_office", "meal_delivery", "convenience_store",
				"bus_station", "gas_station", "school", "hospital", "police", "library",
				"bar", "cafe", "church", "pet_store", "gym", "movie_theater", "park"];

app.use("/test", testCtrl);
app.use("/auth", authCtrl);

// GET Main Page - must fix ejs, route tested
app.get('/', function(req, res) {
	console.log("get/");
	req.session.searchResults = undefined;
	res.render('index');
});

// GET results - must fix ejs, route tested
app.get('/results', function(req, res) {
	console.log("get/results");
	if(req.session.searchResults) {
		var recoverResults = JSON.parse(req.session.searchResults);
		console.log(recoverResults);
		res.send({origin:recoverResults.origin, results:recoverResults.truncatedResults});
	}
	else {
		res.render('index');
	}
});

// GET saved neighborhood - no ejs, not tested
app.get('/results/:email/:neighborhoodID', function(req, res) {
	User.count({email: req.params.email}, function(err, count){
		if (count === 0){
			res.send("Not a valid email address");
		}
		else if (count === 1){
			User.find({email: req.params.email}, function(err, user){
				for(var i = 0; i < user.favorite.length; i++){
					if(user.favorite[i].zillowRegionID === req.params.neighborhoodID){
						res.send(user.favorite);
					}
				}
				res.send("There is no such page.");
			});
		}
	});
});

// POST Results after Main Page - need to fix ejs, route tested
app.post('/results', function(req, res){
	console.log("post/results");
	var origin = {
		street: req.body.streetAddress,
		city: req.body.oldCity,
		state: req.body.oldState,
		zip: req.body.oldZip
	}
	var destinationCity = req.body.newCity;
	var destinationState = req.body.newState;

	var hitsObj = {};

	var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
	var bigAddr = origin.street.replace(/ /g,'+') + '+' + origin.city + '+' + origin.state + '+' + origin.zip;
	console.log("Geocoding " + bigAddr);
	request(geocodeURL + bigAddr + "&key=" + process.env.GOOGLE_PLACES_API_KEY, function(err, geocodeResponse, body){
		if(!err && geocodeResponse.statusCode === 200){
			var data = JSON.parse(body);
			origin['lati'] = data.results[0].geometry.location.lat;
			origin['long'] = data.results[0].geometry.location.lng;

			async.eachSeries(allTypes, function(type, hCallback){
				var requestURL = GOOGLEPLACESAPI + GOOGLEPLACESOUTPUT
				+ "?location=" + origin.lati + "," + origin.long + "&radius=" + RADIUS
				+ "&type=" + type + "&key=" + process.env.GOOGLE_PLACES_API_KEY;

				console.log(requestURL);
				console.log('');

				request(requestURL, function(err, hitsResponse, body) {
					var obj = JSON.parse(body);
					var hits = obj.results.length;
					console.log(type + " has " + hits);
					hitsObj[type] = hits;

					if(obj.error_message){
						console.log(obj.error_message);
						return hCallback(new Error("failed request: " + obj.error_message));
					}
					else {
						hCallback();
					}
				});
			}, function(err){
				if(err){
					console.log(err);
					res.send(err);
				}
				else {
					origin['data'] = hitsObj;
					console.log(origin);
					var superResults = [];

					City.findOne({/*'cityinfo.city': destinationCity, 'cityinfo.state': 'Washington'*/}, function(err, city){
						console.log(city);

						async.eachSeries(city.list, function(neighborhoodListed, nCallback){
							Neighborhood.findOne({zillowRegionID: neighborhoodListed.id}).then(function(neighborhood){
								var score = 0;
								var tally = 0;
								for(var key in origin.data){
									if(origin.data[key] === 0 && neighborhood.data[key] === 0){
										score += 1;
									}
									else if(origin.data[key] === 0 && neighborhood.data[key] != 0){
										score = score;
									}
									else if(origin.data[key] > neighborhood.data[key]){
										score += 1 - Math.abs((neighborhood.data[key] - origin.data[key]) / origin.data[key]);
										console.log(neighborhood.data[key] + " " + origin.data[key])
									}
									else if(origin.data[key] <= neighborhood.data[key]){
										score += 1 - Math.abs((origin.data[key] - neighborhood.data[key]) / neighborhood.data[key]);
										console.log(neighborhood.data[key] + " " + origin.data[key])										
									}
									else{
										console.log("-------");
									}
									tally++;
								}
								var superScore = score / tally * 100;
								superResults.push({neighborhood:neighborhood, score:superScore});

								nCallback();
							});
						}, function(){

							superResults.sort(function(a, b) {
    								return parseFloat(a.score) - parseFloat(b.score);
    						});

    						var truncatedResults = [];

    						for(var i = 0; i < 10; i++){
    							truncatedResults.push(superResults.pop());
    						}

    						req.session.searchResults = JSON.stringify({origin: origin, truncatedResults: truncatedResults});
							res.send({origin:origin, results:truncatedResults});
						});
					});
				}
			});
		}
		else {
			var error = new Error("Geocoding returned an error: " + err + " Status Code: " + res.statusCode);
			res.send(error);
		}
	});
});

app.listen(process.env.PORT || 3000);