const REC_TABLE = require('../data/rec');

module.exports = {
	'getRecInfo' : function(req, def_lang){
		return REC_TABLE[def_lang][req];
	}
};
