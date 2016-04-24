//result vs result

var searchFilters = {
	convenience: {
		enabled: false,
		types: ["bank", "grocery_or_supermarket", "post_office", "meal_delivery", "convenience_store"]
	},
	transportation: {
		enabled: false,
		types: ["bus_station", "gas_station"]
	},
	public: {
		enabled: false,
		types: ["school", "hospital", "police", "library"]
	},
	lifestyle: {
		enabled: true,
		types: ["bar", "cafe", "church", "pet_store", "gym"]
	},
	recreation: {
		enabled: false,
		types: ["movie_theater", "park"]
	}
}

var home = {
	name: "home",
	zillowRegionID: "N/A",
	lati: Number,
	long: Number,
	data: {
		convenience: {
			bank: 1,
			grocery_or_supermarket: 1,
			post_office: 1,
			meal_delivery: 1,
			convenience_store: 1
		},
		transportation: {
			bus_station: 1,
			gas_station: 1
		},
		public: {
			school: 1,
			hospital: 1,
			police: 1,
			library: 1
		},
		lifestyle: {
			bar: 2,
			cafe: 2,
			church: 1,
			pet_store: 1,
			gym: 1
		},
		recreation: {
			movie_theater: 1,
			park: 1
		}
	}
};

var match = {
	name: "match",
	zillowRegionID: "N/A",
	lati: Number,
	long: Number,
	data: {
		convenience: {
			bank: 1,
			grocery_or_supermarket: 1,
			post_office: 1,
			meal_delivery: 1,
			convenience_store: 1
		},
		transportation: {
			bus_station: 1,
			gas_station: 1
		},
		public: {
			school: 1,
			hospital: 1,
			police: 1,
			library: 1
		},
		lifestyle: {
			bar: 1,
			cafe: 1,
			church: 1,
			pet_store: 1,
			gym: 1
		},
		recreation: {
			movie_theater: 1,
			park: 1
		}
	}
};

var unmatched = {
	name: "unmatched",
	zillowRegionID: "N/A",
	lati: Number,
	long: Number,
	data: {
		convenience: {
			bank: 0,
			grocery_or_supermarket: 0,
			post_office: 0,
			meal_delivery: 0,
			convenience_store: 0
		},
		transportation: {
			bus_station: 0,
			gas_station: 0
		},
		public: {
			school: 0,
			hospital: 0,
			police: 0,
			library: 0
		},
		lifestyle: {
			bar: 0,
			cafe: 0,
			church: 0,
			pet_store: 0,
			gym: 0
		},
		recreation: {
			movie_theater: 0,
			park: 0
		}
	}
};

var score = function (origin, candidate) {
	console.log('score(' + origin.name + ',' + candidate.name + ')');
	var tallyTotal = 0;
	var tallyScore = 0;
	for (param in searchFilters){
		console.log('-param = ' + param + ' is ' + searchFilters[param].enabled);
		if (searchFilters[param].enabled) {
			for (key in origin.data[param]) {
				console.log('--key = ' + key);
				if(origin.data[param][key] === 0) {
					console.log('---not in origin');
					tallyTotal += 1;
				}
				else {
					console.log('---calculating');
					tallyTotal += 1;
					var calculatedErr = (candidate.data[param][key] - origin.data[param][key]) / origin.data[param][key];
					tallyScore += 1 - Math.abs(calculatedErr);
					console.log('score so far is ' + tallyScore + " calculatedError was " + calculatedErr);
				}
			}
		}
	}
	return 100 * tallyScore / tallyTotal;
}

console.log("boolean " + searchFilters.lifestyle.enabled)

console.log(score(home, match));
console.log(score(home, unmatched));
