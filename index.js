// SSML
var Speech = require('ssml-builder');

// Custom slot resolution for testing
var stringSimilarity = require('string-similarity');

// General Alexa
//	* Intents
//  * Custom slot types
const Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.82534c6d-52ef-4742-90f3-1945c616832f';

// getDefinitionIntent library
// 	We don't need any others YET (profs/courses/colleges/etc)
// 	as the rest will be dynamically created 😮😳🐫
const definitions = require('./data/definitions');

const languageStrings = {
	'en': {
		translation: {
			DEFINITIONS: definitions.DEFINITION_EN_US,
			SKILL_NAME: 'alexa-tamu',
			DISPLAY_CARD_TITLE: '%s',
			HELP_MESSAGE: 'You could ask me things about classes, or parking lots, or any upcoming games!',
			HELP_REPROMPT: 'Check out alexa.tamu.edu for more information.',
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
			SKILL_NAME: 'alexa-tamu',
		},
	},
};

const handlers = {
	'LaunchRequest': function(){
		var speech = new Speech();
		speech.say('Welcome to Texas A')
			  .pause('5ms')
			  .sub('and', '&')
			  .pause('5ms')
			  .say('M')
			  .pause('10ms')
			  .say('University\'s development Alexa application!')
			  .pause('300ms')
			  .say('Check out')
			  .say('alexa .')
			  .phoneme('ipa', 'tiː-eɪ-ɛm-juː', 'tamu')
			  .say(' .edu to seewhat you can ask me.');

		var s = speech.ssml(true);

		this.attributes.outputSpeech = s;
		this.attributes.repromptSpeech = "Please visit alexa.tamu.edu to learn more.";

		this.response.speak(this.attributes.outputSpeech).listen(this.attributes.repromptSpeech);
		this.emit(':responseReady');
	},
	'GetDefinitionIntent' : function(){
		var defSlot = this.event.request.intent.slots.Definition;

		// To be noted:
		// https://forums.developer.amazon.com/questions/100181/cannot-read-property-resolutionsperauthority-of-un.html
		var defName = defSlot.value;
		if (!(defName in this.t('DEFINITIONS'))){
			if (typeof defSlot.resolutions !== 'undefined'){
				// This occurs:
				// 		developer.amazon.com/alexa/console
				//		in actual use
				const defSlotResolved = defSlot.resolutions.resolutionsPerAuthority[0].values[0];
				defName = defSlotResolved.value.name;
			} else {
				// This only occurs on console.aws.alexa.com
				// This is a little silly and is only for testing, can be removed later
				var closest_key = stringSimilarity.findBestMatch(defName, Object.keys(this.t('DEFINITIONS')))['bestMatch']['target'];
				defName = closest_key;
			}
		}

		var cardTitle = this.t('DISPLAY_CARD_TITLE', this.t('SKILL_NAME'), defName);
		var myDefs = this.t('DEFINITIONS');
		var def = myDefs[defName];

		if (def){
			this.attributes.speechOutput = def;
			this.attributes.repromptSpeech = this.t('DEF_REPEAT_MESSAGE');

			this.response.speak(def).listen(this.attributes.repromptSpeech);
			this.response.cardRenderer(cardTitle, def);
			this.emit(':responseReady');
		} else {
			var speechOutput = this.t('DEF_NOT_FOUND_MESSAGE');
			var repromptSpeech = this.t('DEF_NOT_FOUND_REPROMPT');
			if (defName){
				speechOutput += this.t('DEF_NOT_FOUND_WITH_NAME', defName);
			} else {
				speechOutput += this.t('DEF_NOT_FOUND_WITHOUT_NAME');
			}

			speechOutput += repromptSpeech;
			this.attributes.speechOutput = speechOutput;
			this.attributes.repromptSpeech = repromptSpeech;

			// this.response.speak(defSlot).listen(repromptSpeech);
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
