var mongoose = require('mongoose');

var resultSchema = new mongoose.Schema({
	name: String,
	zillowRegionID: String,
	lati: Number,
	long: Number,
	data: {
		convenience: {
			bank: Number,
			grocery_or_supermarket: Number,
			post_office: Number,
			meal_delivery: Number,
			convenience_store: Number
		},
		transportation: {
			bus_station: Number,
			gas_station: Number
		},
		public: {
			school: Number,
			hospital: Number,
			police: Number,
			library: Number
		},
		lifestyle: {
			bar: Number,
			cafe: Number,
			church: Number,
			pet_store: Number,
			gym: Number
		},
		recreation: {
			movie_theater: Number,
			park: Number
		}
	}
});

var Result = mongoose.model('Result', resultSchema);

module.exports = Result;