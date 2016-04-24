// Requires
var express = require("express");
var request = require("request");
var bodyParser = require('body-parser');
var parser = require('xml2json');
var fs = require('fs');
var ejsLayouts = require("express-ejs-layouts");
var mongoose = require('mongoose');
var app = express();

var testCtrl = require("./controllers/test");

// Middleware
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/project2-myneighborhood');

// Constants
var GOOGLEPLACESAPI = "https://maps.googleapis.com/maps/api/place/nearbysearch/";
var GOOGLEPLACESOUTPUT = "json";
var RADIUS = 800;

app.use("/test", testCtrl);

app.listen(process.env.PORT || 3000);