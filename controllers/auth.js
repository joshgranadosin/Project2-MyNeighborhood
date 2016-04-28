// Requires
var express = require("express");
var request = require("request");
var bodyParser = require('body-parser');
var ejsLayouts = require("express-ejs-layouts");
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var session = require('express-session');
var router = express.Router();

var City = require('./../models/city.js');
var Neighborhood = require('./../models/neighborhood.js');
var User = require('./../models/user.js');

// middleware
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Constants
var GOOGLEPLACESAPI = "https://maps.googleapis.com/maps/api/place/nearbysearch/";
var GOOGLEPLACESOUTPUT = "json";
var RADIUS = 800;

// GET signin form - Need to fix ejs - route tested.
router.get('/signin', function(req, res) {
	if(req.session.user) {
		res.send('signed in as ' + req.session.user);
	}
	else {
		res.render('signin');
	}
});

// GET signup form - signup.ejs - Need to fix ejs - route tested.
router.get('/signup', function(req, res) {
	if(req.session.searchResults) {
		var recoverResults = JSON.parse(req.session.searchResults);
		res.render('signup', {formfill: true, results: recoverResults});
	}
	else {
		res.render('signup', {formfill: false, results: null});
	}
});

// GET favorite - favorites.ejs - Not done
router.get('/favorites', function(req, res) {
	if(req.session.user) {
		res.send('favorites');
	}
	else {
		res.send('must be signed in');
	}
});

// GET favorite (show) - show.ejs - Not done, might just redirect
router.get('/favorite/:email/:neighborhoodID', function(req, res) {
	res.send('favorites');
});

// GET signout - index.ejs - tested
router.get('/signout', function(req, res) {
	req.session.user = undefined;
	res.redirect('/');
});

// POST existing user signin - results.ejs - Need to fix ejs. - route tested, 
router.post('/signin', function(req, res) {
	User.findOne({email: req.body.email}, function(err, user){
		console.log(user);

		bcrypt.compare(req.body.password, user.password, function(err, result){
			if(err){
	 			console.log(err);
				res.send(err);
	 		}
	 		else if(result === true) {
	 			console.log(result);
	 			req.session.user = user.email;
				res.send("Password matched!");
			}
			else {
				console.log(result);
				res.send("Password did not match.")
			}
		});
	});
});

// POST new user signup - results.ejs - Need to fix ejs. - route tested
router.post('/signup', function(req, res) {
	var newUser = new User({
		email: req.body.email,
		password: req.body.password,
		address: req.body.address
	});
	console.log(newUser);

	newUser.save(function(err, doc){
		if(err) {
			console.log(err);
			if(err.code === 11000) {
				res.send("Email already taken");
			}
			else {
				res.send("Something went wrong");
			}
		}
		else {
			console.log(doc);
			res.send(doc);
		}
	});
});

// POST new favorite route - Done, not tested
router.post('/favorites/:email/:neighborhoodID', function(req, res) {
	if(req.session.user === req.params.email) {
		User.findOne({email: req.session.user}, function(err, user) {
			var recoverResults = JSON.parse(req.session.searchResults);
			var neighborhoodToSave = undefined;

			for(var i = 0; i < recoverResults.truncatedResults.length; i++) {
				if(req.params.neighborhoodID === recoverResults.truncatedResults[i].neighborhood.zillowRegionID){
					neighborhoodToSave = recoverResults.truncatedResults[i];
				}
			}

			if(neighborhoodToSave) {
				user.favorite.push(neighborhoodToSave);
				user.save(function(err, doc) {
					if(err) {
						console.log(err);
						res.send("Something went wrong");
					}
					else {
						console.log("Saved: " + doc);
						res.sendStatus(200);
					}
				});
			}
			else {
				console.log("Couldn't find that neighborhood among results");
				res.send("Couldn't find that neighborhood among results");
			}
		});
	}
	else {
		res.send('Error... must be logged in as ' + req.params.email + 'to complete this action.');
	}
});

// DELETE favorite route - Done, not tested
router.delete('/favorites/:email/:neighborhoodID', function(req, res) {
	if(req.session.user === req.params.email) {
		User.findOne({email: req.session.user}, function(err, user) {
			var neighborhoodToRemove = undefined;

			for(var i = 0; i < user.favorite.length; i++) {
				if(req.params.neighborhoodID === user.favorite[i].neighborhood.zillowRegionID) {
					neighborhoodToRemove = user.favorite[i].pop();
				}
			}

			if(neighborhoodToRemove) {
				user.save(function(err, doc) {
					if(err){
						console.log(err);
						res.send("Something went wrong");
					}
					else {
						console.log("deleted: " + doc);
						res.sendStatus(200);
					}
				});
			}
			else {
				console.log("Nothing deleted");
				res.send("Nothing deleted");
			}
		});
	}
	else {
		res.send('You must be logged in as ' + req.params.email + ' to complete this action.');
	}
});

module.exports = router;
