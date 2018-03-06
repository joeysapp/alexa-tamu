const Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback){
	const alexa = Alexa.handler(event, context, callback);
	alexa.appId = "amzn1.ask.skill.82534c6d-52ef-4742-90f3-1945c616832f";
	alexa.registerHandlers(handlers);
	alexa.execute();
};

const handlers = {
	'HelloWorldIntent' : function(){
		this.response.speak('Hello world!');
		this.emit(':responseReady');
	}
};











