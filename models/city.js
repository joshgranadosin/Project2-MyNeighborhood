var mongoose = require('mongoose');

var citySchema = new mongoose.Schema({
	name: String,
	lastName: String,
	list: Object
});

var City = mongoose.model('City', citySchema);

module.exports = City;