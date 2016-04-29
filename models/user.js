var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var request = require('request');
var async = require('async');

// Constants
var GOOGLEPLACESAPI = "https://maps.googleapis.com/maps/api/place/nearbysearch/";
var GOOGLEPLACESOUTPUT = "json";
var RADIUS = 800;
var allTypes = ["bank", "grocery_or_supermarket", "post_office", "meal_delivery", "convenience_store",
				"bus_station", "gas_station", "school", "hospital", "police", "library",
				"bar", "cafe", "church", "pet_store", "gym", "movie_theater", "park"];

var userSchema = new mongoose.Schema({
	email: {
		type: String,
		validate: {
			validator: function(v) {
				return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
			},
			message: "Must use a valid email address."
		},
		required: [true, "Must have an email address to register."],
		unique: true
	},
	password: {
		type: String,
		min: [8, "Your password must be 8-20 characters."],
		max: [20, "Your password must be 8-20 characters."],
		required: [true, "Your password must be 8-20 characters."]
	},
	address: {
		type: String,
		required: true
	},
	lati: Number,
	long: Number,
	data: {
		//convenience:
		bank: Number,
		grocery_or_supermarket: Number,
		post_office: Number,
		meal_delivery: Number,
		convenience_store: Number,
		
		//transportation:
		bus_station: Number,
		gas_station: Number,
		
		//public:
		school: Number,
		hospital: Number,
		police: Number,
		library: Number,
		
		//lifestyle:
		bar: Number,
		cafe: Number,
		church: Number,
		pet_store: Number,
		gym: Number,
		
		//recreation:
		movie_theater: Number,
		park: Number
	},
	favorite: {
		type: Array,
		default: []
	}
});

userSchema.pre('save', function(next){
	var self = this;

	var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
	var bigAddr = self.address.replace(/ /g,'+');
	console.log("Geocoding " + bigAddr);
	request(geocodeURL + bigAddr + "&key=" + process.env.GOOGLE_PLACES_API_KEY, function(err, res, body){
		if(!err && res.statusCode === 200){
			var data = JSON.parse(body);
			self.lati = data.results[0].geometry.location.lat;
			self.long = data.results[0].geometry.location.lng;

			var hitsObj = {};

			async.each(allTypes, function(type, hCallback){
				var requestURL = GOOGLEPLACESAPI + GOOGLEPLACESOUTPUT
				+ "?location=" + self.lati + "," + self.long + "&radius=" + RADIUS
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
						return hCallback(new Error("failed request: " + obj.error_message));
					}
					else {
						hCallback();
					}
				});
			}, function(err){
				console.log("After async function")
				if(err){
					console.log(err);
					return next(err);
				}
				else {
					self.data = hitsObj;
					bcrypt.hash(self.password, 10, function(err, hash){
						if(err) {
							return next(err);
						}
			            self.password = hash;
			            self.email = self.email.toLowerCase();
			            console.log("succeeded hash");
			            next();
					});
				}
			});
		}
		else {
			var error = new Error("Geocoding returned an error: " + err + " Status Code: " + res.statusCode);
			next(error);
		}
	});
});

var User = mongoose.model('User', userSchema);

module.exports = User;