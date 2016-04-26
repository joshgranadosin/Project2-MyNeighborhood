var fs = require('fs');
var xml2js = require('xml2js');
var mongoose = require('mongoose');
var parser = new xml2js.Parser({explicitRoot:false, ignoreAttrs:true, explicitArray:false});
var request = require('request');
var async = require('async');

var City = require('./../models/city.js');
var Neighborhood = require('./../models/neighborhood.js')

mongoose.connect('mongodb://localhost/project2-myneighborhood');

// Constants
var GOOGLEPLACESAPI = "https://maps.googleapis.com/maps/api/place/nearbysearch/";
var GOOGLEPLACESOUTPUT = "json";
var RADIUS = 800;
var allTypes = ["bank", "grocery_or_supermarket", "post_office", "meal_delivery", "convenience_store",
				"bus_station", "gas_station",
				"school", "hospital", "police", "library",
				"bar", "cafe", "church", "pet_store", "gym",
				"movie_theater", "park"]

var addSeattle = function () {
	City.count({'cityInfo.city':'Seattle', 'cityInfo.state':'Washington'}, function (err, count) {
		if(count > 0){
			City.findOne({'cityInfo.city':'Seattle', 'cityInfo.state':'Washington'}, function(err, city){
				if(err){
					console.log(err)
					mongoose.disconnect();
				}
				else {
					console.log('city.cityInfo');
					console.log(city.cityInfo);
					console.log('');
					console.log('city.list[0]');
					console.log('');
					mongoose.disconnect();
				}
			});
		}
		else {
			fs.readFile("./seed/xml/Seattle.xml", 'utf8', function(err, xml) {
				if (err) {
					console.log(err);
					mongoose.disconnect();
				}
				else {
					parser.parseString(xml, function(err, result) {
						if (err) {
							console.log(err);
							mongoose.disconnect();
						}
						else {
							var cityInfo = result.response.region;

							var list = result.response.list.region;

							newCity = new City({
								cityInfo: cityInfo,
								list: list
							});

							console.log("newCity.cityInfo: ");
							console.log(newCity.cityInfo);
							console.log('');
							console.log('newCity.list[0]');
							console.log(newCity.list[0]);
							console.log('');

							newCity.save(function(err, doc){
								if(err){
									console.log(err);
								}
								else {
									console.log("Success. Please check the database.");
									console.log('');
								}
								mongoose.disconnect();
							});
						}
					});
				}
			});
		}
	});
}

var addNeighborhoods = function() {
	City.findOne({'cityInfo.city':'Seattle', 'cityInfo.state':'Washington'}, function(err, city){
		var n = city.list[0];
		nName = n.name;
		nID = n.id;
		nLati = n.latitude;
		nLong = n.longitude;

		hitsObj  = {};

		async.forEach(allTypes, function(type, callback){
			var requestURL = GOOGLEPLACESAPI + GOOGLEPLACESOUTPUT
			+ "?location=" + nLati + "," + nLong + "&radius=" + RADIUS
			+ "&type=" + type + "&key=" + process.env.GOOGLE_PLACES_API_KEY;

			console.log(requestURL), 1000);
			console.log(''), 1000);

			request(requestURL, function(err, response, body) {
				var obj = JSON.parse(body);
				var hits = obj.results.length;
				console.log(type + " has " + hits);
				hitsObj[type] = hits;
			});

			callback();
		}, function(err){
			if(err){
				console.log(err);
			}
			else {
				console.log("End of allTypes array");
				console.log(hitsObj);
				mongoose.disconnect();
			}
		});
	});
}

addNeighborhoods();