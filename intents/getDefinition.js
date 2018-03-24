const DEF_TABLE = require('../data/definitions');

module.exports = {
	'getDefinition' : function(req, def_lang){
		return DEF_TABLE[def_lang][req];
	}
};