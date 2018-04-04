const DEF_TABLE = require('../data/helpdesk');

module.exports = {
	'getHelpdesk' : function(req, def_lang){
		return DEF_TABLE[def_lang][req];
	}
};
