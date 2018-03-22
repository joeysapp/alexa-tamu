// SSML
const Speech = require('ssml-builder');

// Custom slot resolution for testing
const stringSimilarity = require('string-similarity');

// General Alexa
//	* Intents
//  * Custom slot types 😮😳🐫
const Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.82534c6d-52ef-4742-90f3-1945c616832f';

// Static Content
const definitions = require('./data/definitions');
const locations = require('./data/locations');

const garages = require('./data/locations');

// Dynamic Content
const request = require('request');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const languageStrings = {
	'en': {
		translation: {
			DEFINITIONS: definitions.DEFINITION_EN_US,
			LOCATIONS: locations.LOCATION_EN_US,
			GARAGES: garages.GARAGE_EN_US,
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
			LOC_NOT_FOUND_MESSAGE: 'I\'m sorry, I currently don\'t know ',
			LOC_NOT_FOUND_WITH_NAME: 'the location of %s. ',
			LOC_NOT_FOUND_WITHOUT_NAME: 'that location.',
			LOC_NOT_FOUND_REPROMPT: 'What else can I help you with?',
		},
	},
	'en-us' : {
		translation: {
			DEFINITIONS: definitions.DEFINITION_EN_US,
			LOCATIONS: locations.LOCATION_EN_US,
			SKILL_NAME: 'alexa-tamu',
		},
	},
};

const handlers = {
	'LaunchRequest': function(){
		var speech = new Speech();
		speech.say("Welcome to Texas A&M University's Alexa dev app! Visit alexa.tamu.edu for more info.");
		var s = speech.ssml(true);

		this.attributes.outputSpeech = s;
		this.attributes.repromptSpeech = "Please visit alexa.tamu.edu to learn more.";

		this.response.speak(this.attributes.outputSpeech).listen(this.attributes.repromptSpeech);
		this.emit(':responseReady');
	},
	'GetSportsInfoIntent' : function(){
		var reqSportType = this.event.request.intent.slots.SportType;
		var reqRivalTeam = this.event.request.intent.slots.RivalTeam;
		if (!reqSportType.value){
			const slotToElicit = 'SportType';
			const speechOutput = 'What sport would you like to hear about?';
			this.emit(':elicitSlot', slotToElicit, speechOutput, speechOutput);
		} else {
			reqSportType = reqSportType.value;
			var url = 'https://www.12thmanfoundation.com/ticket-center/sport/'+reqSportType;
			request(url, (err, res, body) => {
				var games = [];
				var tmp = new JSDOM(body);
				var tmp = tmp.window.document.querySelector('').textContext;


				this.response.speak('You\'d like to hear about '+reqSportType);
				this.response.cardRenderer('alexa-tamu', games);
				this.emit(':responseReady');			
			});

		}
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
	'GetGarageIntent' : function(){
		var garage_slot = this.event.request.intent.slots.Garage;
		var garage_name = garage_slot.value;
		// my goal is to send the value from the garage JSON to my python file
		// then to take the number of spots and tell alexa to say something
		// depending on if there are diffenet amounts of vacancies
		// example: if less than 30 spots say "CCG only has 20 spots left, but ucg has 150"
		// this example would obviously require to calls to python function
		var spawn = require("child_process").spawn;
		var pythonProcess = spawn('python',["..\scripts\garage.py", arg1]);
		pythonProcess.stdout.on('data', function (data){
			if(parseInt(data, 10) <= 50) {
				var output = "Sorry there are only " + 'data' + " spots left at " + garage_name;
				this.emit(':tell', output);
			}
			else {
				var output = "There are still " + 'data' + " spotse left at " + garage_name;
				this.emit(':tell', output);
			}
		});
	},
	'GetLocationIntent' : function(){
		var location_slot = this.event.request.intent.slots.Location;
		var location_name = location_slot.value;
		if (!(location_name in this.t('LOCATIONS'))){
			if (typeof location_slot.resolutions !== 'undefined'){
				// This occurs:
				// 		developer.amazon.com/alexa/console
				//		in actual use
				const location_slot_resolved = location_slot.resolutions.resolutionsPerAuthority[0].values[0];
				location_name = location_slot_resolved.value.name;
			} else {
				// This only occurs on console.aws.alexa.com
				// This is a little silly and is only for testing, can be removed later
				var closest_key = stringSimilarity.findBestMatch(location_name, Object.keys(this.t('DEFINITIONS')))['bestMatch']['target'];
				location_name = closest_key;
			}
		}

		var cardTitle = this.t('DISPLAY_CARD_TITLE', this.t('SKILL_NAME'), location_name);
		var cur_locations = this.t('LOCATIONS');
		var location_info = cur_locations[location_name];

		if (location_info){
			var url = "https://aggiemap.tamu.edu/?bldg="+location_info["url"];
			var speechOutput = "You can find "+location_name+" on AggieMap at the url I've sent your Alexa application.";
			this.attributes.speechOutput = speechOutput;
			this.attributes.repromptSpeech = this.t('DEF_REPEAT_MESSAGE');

			this.response.speak(speechOutput).listen(this.attributes.repromptSpeech);
			this.response.cardRenderer(cardTitle, url);
			this.emit(':responseReady');
		} else {
			var speechOutput = this.t('LOC_NOT_FOUND_MESSAGE');
			var repromptSpeech = this.t('LOC_NOT_FOUND_REPROMPT');
			if (location_name){
				speechOutput += this.t('LOC_NOT_FOUND_WITH_NAME', location_name);
			} else {
				speechOutput += this.t('LOC_NOT_FOUND_WITHOUT_NAME');
			}

			speechOutput += repromptSpeech;
			this.attributes.speechOutput = speechOutput;
			this.attributes.repromptSpeech = repromptSpeech;

			// this.response.speak(defSlot).listen(repromptSpeech);
			this.response.speak(speechOutput).listen(repromptSpeech);
			this.emit(':responseReady');
		}
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
