var fs = require('fs');
var xml2js = require('xml2js');
var mongoose = require('mongoose');
var parser = new xml2js.Parser({explicitRoot:false, ignoreAttrs:true, explicitArray:false});

var City = require('./../models/city.js');

mongoose.connect('mongodb://localhost/project2-myneighborhood');


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
						console.log("cityInfo: ")
						console.log(cityInfo);
						console.log('');

						var list = result.response.list.region;
						console.log("list: ");
						console.log(list);
						console.log('');

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
})