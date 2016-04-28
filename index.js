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

// GET results - results.ejs must fix ejs, route tested
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

// GET saved neighborhood - show.ejs - no ejs, not tested
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
						//res.render({show:user.favorite});
					}
				}
				res.send("There is no such page.");
			});
		}
	});
});

// POST Results after Main Page - results.ejs need to fix ejs, route tested
app.post('/results', function(req, res){
	console.log("post/results");
	var origin = req.body.address;
	var destination = req.body.destination;

	var hitsObj = {};

	var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
	console.log("Geocoding " + origin);
	request(geocodeURL + origin.replace(' ', '+') + "&key=" + process.env.GOOGLE_PLACES_API_KEY, function(err, geocodeResponse, body){
		if(!err && geocodeResponse.statusCode === 200){
			var data = JSON.parse(body);
			var lati = data.results[0].geometry.location.lat;
			var long = data.results[0].geometry.location.lng;

			async.eachSeries(allTypes, function(type, hCallback){
				var requestURL = GOOGLEPLACESAPI + GOOGLEPLACESOUTPUT + "?location=" + lati + "," + long + "&radius=" + RADIUS
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
					var superResults = [];

					City.findOne({/*'cityinfo.city': destinationCity, 'cityinfo.state': 'Washington'*/}, function(err, city){
						console.log(city);

						async.eachSeries(city.list, function(neighborhoodListed, nCallback){
							Neighborhood.findOne({zillowRegionID: neighborhoodListed.id}).then(function(neighborhood){
								var score = 0;
								var tally = 0;
								for(var key in hitsObj){
									if(hitsObj[key] === 0 && neighborhood.data[key] === 0){
										score += 1;
									}
									else if(hitsObj[key] === 0 && neighborhood.data[key] != 0){
										score = score;
									}
									else if(hitsObj[key] != 0 && neighborhood.data[key] === 0){
										score = score;
									}
									else {
										var difference = Math.abs(hitsObj[key] - neighborhood.data[key]);
										var average = (hitsObj[key] + neighborhood.data[key]) / 2;
										score += 1 - (difference / average);
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
    						var home = {
    							origin: origin,
    							lati: lati,
    							long: long
    						}

    						req.session.searchResults = JSON.stringify({home:home, hits:hitsObj, truncatedResults: truncatedResults});
							//res.send({home:home, hits:hitsObj, results:truncatedResults});
							res.render('results', {
								home: home,
								hits: hitsObj,
								results:truncatedResults
							});
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