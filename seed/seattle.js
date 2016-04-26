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
		neighborhoodList = [];

		async.eachSeries(city.list, function(n, nCallback){
			nLati = n.latitude;
			nLong = n.longitude;

			hitsObj  = {};

			async.eachSeries(allTypes, function(type, hCallback){
				var requestURL = GOOGLEPLACESAPI + GOOGLEPLACESOUTPUT
				+ "?location=" + nLati + "," + nLong + "&radius=" + RADIUS
				+ "&type=" + type + "&key=" + process.env.GOOGLE_PLACES_API_KEY;

				console.log(requestURL);
				console.log('');

				request(requestURL, function(err, response, body) {
					var obj = JSON.parse(body);
					var hits = obj.results.length;
					console.log(type + " has " + hits);
					hitsObj[type] = hits;

					if(obj.error_message){
						console.log(obj.error_message);
						return hCallback(new Error("failed request:" + obj.error_message));
					}
					else {
						hCallback();
					}
				});
			}, function(err){
				if(err){
					console.log(err);
					return nCallback(err);
				}
				else {
					newN = new Neighborhood({
						name: n.name,
						zillowRegionID: n.id,
						lati: n.latitude,
						long: n.longitude,
						data: hitsObj
					});
					console.log(newN);
					neighborhoodList.push(newN);
					nCallback();
				}
			});
		}, function(err){
			if(err){
				console.log(err);
				mongoose.disconnect();
			}
			else {
				neighborhoodList.forEach(function(neighborhood){
					console.log("Saving " + neighborhood.name);
					neighborhood.save();
				});
				console.log("Saved all neighborhoods");
				mongoose.disconnect();
			}
		});
	});
}

addNeighborhoods();