//requires
var express = require("express");
var request = require("request");
var bodyParser = require('body-parser');
var parser = require('xml2json');
var fs = require('fs');
var ejsLayouts = require("express-ejs-layouts");

var app = express();
app.set('view engine', 'ejs');

app.use(ejsLayouts);

app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var express = require("express");
var request = require("request");

// Dummy Data
var startAddress = { // used for testing
	address: '16230 NE 99TH ST',
	city: 'REDMOND',
	state: 'WA',
	zip: '98052'
}

var endCity = { // used for testing
	city: 'Seattle',
	state: 'WA'
}

// Default search filters
var searchFilters = { // true for what you care is/isn't there. false if it don't matter
	// family
	park: true,
	school: true,
	library: false,
	pet_store: false,
	// convieniece
	meal_delivery: false,
	grocery_or_supermarket: false,
	gas_station: false,
	bus_station: false,
	// life style
	gym: false,
	cafe: false,
	night_club: false,
	bar: true
}


// Throw away, read seattle xml
app.get('/Seattle', function(req, res) {
	fs.readFile("./seed/xml/Seattle.xml", 'utf8', function(err, xml) {
		var json = parser.toJson(xml);
		console.log(json);
		res.send(json);
	});
});

app.listen(process.env.PORT || 3000);
