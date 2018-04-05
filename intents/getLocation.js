const LOCATION_TABLE = require('../data/locations');

module.exports = {
	'getLocation' : function(req, def_lang){
		console.log(LOCATION_TABLE[def_lang][req]);
		console.log('hello');
		return LOCATION_TABLE[def_lang][req];
	},
	'getLocationWithCardObject' : function(req, def_lang){
		return LOCATION_TABLE[def_lang][req];
	},
};
