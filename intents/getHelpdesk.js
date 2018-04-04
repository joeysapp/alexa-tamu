const HELPDESK_TABLE = require('../data/helpdesk');

module.exports = {
	'getHelpdesk' : function(req, def_lang){
		return HELPDESK_TABLE[def_lang][req];
	}
};
