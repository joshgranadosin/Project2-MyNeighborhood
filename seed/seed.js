var express = require("express");
var request = require("request");

var parser = require('xml2json');
var fs = require('fs');

app.get('/', function(res, req) {
		fs.readFile("./seed/xml/Seattle.xml", 'utf8', function(err, xml) {
		var json = parser.toJson(xml);
		console.log(json);
		res.send(json);
	});
});


// fs.readFile("./xml/Seattle.xml", 'utf8', function(err, xml) {
// 	var json = parser.toJson(xml);
// 	console.log(json);
// });


app.listen(process.env.PORT || 3000);

