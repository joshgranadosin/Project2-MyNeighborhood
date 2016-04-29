# Project2-MyNeighborhood
Find a neighborhood in Seattle just like yours

Technologies used:

Server:
	Node.js Express running on Heroku
Database:
	MongoDB on Heroku's mLabs connected via Mongoose
APIs:
	Zillow (planned for get Region Children)
	Google Places
	Panoramia
NPM Modules:
	async
	bcrypt
	body-parser
	ejs	
	express
	express-ejs-layouts
	express-session
	fs
	layouts
	mongoose
	request
	validator
	xml2js

Approach Taken:
	I started with the user story; Jason Persona is moving to Seattle but want to go to a neighborhood similar to where he's from.

	Then, I searched for APIs for information needed. I spent a couple of days just to filter and store data into the database. I created a test controller to view raw data and see how I'm passing it around.

	With that, I had a basis for creating my routes and web layouts. I tried using bootstrap and wireframes to make it easier, but I ran out of time.

	I deployed to Heroku and mLabs after.

Installation instructions:
	Fork my code using git/github.
	Install the dependencies using npm install. The package.json file should know which modules to install.
	Get API keys for Google Map APIs. You may need to input a credit card and enable billing because you can run out of API calls during database seeding and development.
	Create a mongo database. My project name is Project2-myneighborhood, but you can have any name, just edit the mongoose.connect code. Seattle.js has functions that can seed your databse with an included file Seattle.xml.
	If you decide to deploy to heroku, you'll need to have heroku create an mLab account and seed the database.	The easiest way is to export your database as a .json file and import it through mLab's tools.

Unsolved Problems:
	The data is obtained through A LOT of api calls. To prevent this, you can seed the database each time a query is run or limit the query to what is seeded in the database. I ended up with the latter because of loading speed issues. The most elegant solution would be to find other sources for the data.

	I did not have enough time to fully flesh out the site. The show route is not working. I don't have a way to grab descriptions of each location. Favorites is not working. Logging in doesn't change the user experience. Sharing is not working.

	Pictures are obtained via Panoramia. It will not work when running as an https. I may need to force http or get pictures from else where.


