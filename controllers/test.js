// Requires
var express = require("express");
var request = require("request");
var bodyParser = require('body-parser');
var xml2js = require('xml2js');
var fs = require('fs');
var ejsLayouts = require("express-ejs-layouts");
var mongoose = require('mongoose');
var router = express.Router();

// middleware
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
var parser = new xml2js.Parser({explicitRoot:false})

// models
var City = require('./../models/city.js');
var Neighborhood = require('./../models/neighborhood.js');
var User = require('./../models/user.js');

// Dummy Data
var startAddress = { // used for testing
	address: '16230 NE 99TH ST',
	city: 'REDMOND',
	state: 'WA',
	zip: '98052',
	lati: 47.6891625,	// pos for north (All of USA)
	long: -122.1256417	// neg for west (All of USA)
}

var endCity = { // used for testing
	city: 'Seattle',
	state: 'WA'
}

// Constants
var GOOGLEPLACESAPI = "https://maps.googleapis.com/maps/api/place/nearbysearch/";
var GOOGLEPLACESOUTPUT = "json";
var RADIUS = 800;

// Throw away, read seattle xml
router.get('/Seattle', function(req, res) {
	fs.readFile("./seed/xml/Seattle.xml", 'utf8', function(err, xml) {
		parser.parseString(xml, function(err, result){
			console.log(result);
			res.send(result);
		});
	});
});

router.get('/city', function(req,res) {
	City.findOne({}, function(err, result){
		console.log(result.list);
		res.send(result.list);
	})
})


// Throw away, get google's data about 16230
router.get('/Redmond', function(req, res) {
	var type = "bus_station";
	var requestURL = GOOGLEPLACESAPI + GOOGLEPLACESOUTPUT
		+ "?location=" + startAddress.lati + "," + startAddress.long + "&radius=" + RADIUS
		+ "&type=" + type + "&key=" + process.env.GOOGLE_PLACES_API_KEY;

		console.log(requestURL);

	request(requestURL, function(err, response, body) {
		res.send(body);
	});
});

// Throw away, tally vicinity data for 13657
router.get('/Kirkland', function(req, res) {
	var requestURL =  GOOGLEPLACESAPI + GOOGLEPLACESOUTPUT
		+ "?location=" + startAddress.lati + "," + startAddress.long + "&radius=" + RADIUS
		+ "&type=" + type + "&key=" + process.env.GOOGLE_PLACES_API_KEY;
	
});

router.get('/user/:userEmail', function(req, res) {
	User.findOne({email: req.params.userEmail}, function(err, user){
		res.send(user);
	});
});

router.get('/show/:zillowRegionID', function(req, res) {
	Neighborhood.count({zillowRegionID: req.params.zillowRegionID}, function(err, count){
		if(count > 0){
			Neighborhood.findOne({zillowRegionID: req.params.zillowRegionID}, function(err, neighborhood){
				res.send(neighborhood);
			});
		}
	});
});

router.get('/show', function(req, res) {
	res.render('show');
});

router.get('/results', function(req, res) {
	res.render('results');
});

module.exports = router;