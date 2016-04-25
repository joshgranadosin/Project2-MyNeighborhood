var mongoose = require('mongoose');

var citySchema = new mongoose.Schema({
	cityInfo: Object,
		// id: Number,
		// country: String,
		// state: String,
		// county: String,
		// city: String,
		// cityURL: String,
		// latitude: Number,
		// longitude: Number
	list: Array //items are inside an array
		// id: Number,
		// name: String,
		// zindex: Object,
		// url: String,
		// latitude: Number,
		// longitude: Number
});

var City = mongoose.model('City', citySchema);

module.exports = City;