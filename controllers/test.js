// Requires
var express = require("express");
var request = require("request");
var bodyParser = require('body-parser');
var parser = require('xml2json');
var fs = require('fs');
var ejsLayouts = require("express-ejs-layouts");
var mongoose = require('mongoose');
var router = express.Router();

// middleware
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

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


// Default search filters
var searchFilters = {
	convenience: {
		enabled: false,
		types: ["bank", "grocery_or_supermarket", "post_office", "meal_delivery", "convenience_store"]
	},
	transportation: {
		enabled: false,
		types: ["bus_station", "gas_station"]
	},
	public: {
		enabled: false,
		types: ["school", "hospital", "police", "library"]
	},
	lifestyle: {
		enabled: true,
		types: ["bar", "cafe", "church", "pet_store", "gym"]
	},
	recreation: {
		enabled: false,
		types: ["movie_theater", "park"]
	}
}

// Constants
var GOOGLEPLACESAPI = "https://maps.googleapis.com/maps/api/place/nearbysearch/";
var GOOGLEPLACESOUTPUT = "json";
var RADIUS = 800;

// Throw away, read seattle xml
router.get('/Seattle', function(req, res) {
	fs.readFile("./seed/xml/Seattle.xml", 'utf8', function(err, xml) {
		var json = parser.toJson(xml);
		console.log(json);
		res.send(json);
	});
});

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

module.exports = router;