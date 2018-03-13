const Alexa = require('alexa-sdk');
const APP_ID = "amzn1.ask.skill.82534c6d-52ef-4742-90f3-1945c616832f";
const definitions = require('./definitions');

const languageStrings = {
	'en': {
		translation: {
			DEFINITIONS: definitions.DEFINITION_EN_US,
			SKILL_NAME: 'Texas A and M Helpdesk',
			WELCOME_MESSAGE: "Welcome to %s. You can ask a question like, who are the yell leaders? ... Now, what can I help you with?",
			WELCOME_REPROMPT: 'For instructions on what you can ask, please say help me.',
			DISPLAY_CARD_TITLE: '%s',
			HELP_MESSAGE: 'You can ask questions like who is Johnny Manziel, or who is on the football team?',
			HELP_REPROMPT: 'You can ask questions like who is Johnny Manziel, or who is on the football team?',
			STOP_MESSAGE: 'Goodbye!',
			DEF_REPEAT_MESSAGE: 'Try saying repeat.',
			DEF_NOT_FOUND_MESSAGE: 'I\'m sorry, I currently don\'t know ',
			DEF_NOT_FOUND_WITH_NAME: 'the definition for %s. ',
			DEF_NOT_FOUND_WITHOUT_NAME: 'that definition.',
			DEF_NOT_FOUND_REPROMPT: 'What else can I help you with?',
		},
	},
	'en-us' : {
		translation: {
			DEFINITIONS: definitions.DEFINITION_EN_US,
			SKILL_NAME: 'Texas A and M Helpdesk',
		},
	},
};

const handlers = {
	'LaunchRequest': function(){
		this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
		this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');

		this.response.speak(this.attributes.speechOut).listen(this.attributes.repromptSpeech);
		this.emit(':responseReady');
	},
	'GetDefinitionIntent' : function(){
		const defSlot = this.event.request.intent.slots.Definition;
		const defName = defSlot.value;

		const cardTitle = this.t('DISPLAY_CARD_TITLE', this.t('SKILL_NAME'), defName);
		const myDefs = this.t('DEFINITIONS');
		const def = myDefs[defName];

		if (def){
			this.attributes.speechOutput = def;
			this.attributes.repromptSpeech = this.t('DEF_REPEAT_MESSAGE');

			this.response.speak(def).listen(this.attributes.repromptSpeech);
			this.response.cardRenderer(cardTitle, def);
			this.emit(':responseReady');
		} else {
			let speechOutput = this.t('DEF_NOT_FOUND_MESSAGE');
			const repromptSpeech = this.t('DEF_NOT_FOUND_REPROMPT');
			if (defName){
				speechOutput += this.t('DEF_NOT_FOUND_WITH_NAME', defName);
			} else {
				speechOutput += this.t('DEF_NOT_FOUND_WITHOUT_NAME');
			}

			speechOutput += repromptSpeech;
			this.attributes.speechOutput = speechOutput;
			this.attributes.repromptSpeech = repromptSpeech;

			this.response.speak(speechOutput).listen(repromptSpeech);
			this.emit(':responseReady');
		}
	},
	'GetLocationIntent' : function(){
        this.response.speak("GetLocationIntent!");
        this.emit(':responseReady');
	},
	'GetBusStatusIntent' : function(){
        this.response.speak("GetBusStatusIntent!");
        this.emit(':responseReady');
	},
	'GetCollegeIntent' : function(){
        this.response.speak("GetCollegeIntent!");
        this.emit(':responseReady');
	},
	'AMAZON.HelpIntent': function () {
		this.attributes.speechOutput = this.t('HELP_MESSAGE');
		this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
		
		this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
		this.emit(':responseReady');
	},
    'AMAZON.RepeatIntent': function () {
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log(`Session ended: ${this.event.request.reason}`);
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
