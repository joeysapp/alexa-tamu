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

// Dynamic Content
const request = require('request'); 
const cheerio = require('cheerio'); // DOM Parser
const _ = require('lodash'); // Functional Library

const languageStrings = {
	'en': {
		translation: {
			DEFINITIONS: definitions.DEFINITION_EN_US,
			LOCATIONS: locations.LOCATION_EN_US,
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
				if (!err && res.statusCode == 200){
					const $ = cheerio.load(body);

					// Parsing of $
					var tmp = null;

					this.response.speak('You\'d like to hear about '+tmp);
					this.response.cardRenderer('alexa-tamu', tmp);
					this.emit(':responseReady');
				}			
			});
		}
	},
	'GetDefinitionIntent' : function(){
		var defSlot = this.event.request.intent.slots.Definition;
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
	'GetGarageInfoIntent' : function(){
		var reqGarageType = this.event.request.intent.slots.GarageName;
		if (!reqGarageType.value){
			const slotToElicit = 'GarageName';
			const speechOutput = 'What garage would you like to hear about?';
			this.emit(':elicitSlot', slotToElicit, speechOutput, speechOutput);
		} else {
			reqGarageName = reqGarageType.value;
			var url = 'http://transport.tamu.edu/parking/realtime.aspx';
			request(url, (err, res, body) => {
				if (!err && res.statusCode === 200){
					const $ = cheerio.load(body);

					counts = [];
					// We use the DOM element $() to access an array of all
					// elements of the class 'badge' that are children of elements
					// of the class 'count'. Then, for each of these elements,
					// we iterate through and push the trimmed (whitespace) data
					// that happens to be the current garage counts to an array counts.
					Array.from($('.count > .badge').slice(0,5)).forEach(element => {
						counts.push(_.trim(element.children[0].data));
					});

					const garages = ['Cain Garage', 'Central Campus Garage', 'University Center Garage', 'West Campus Garage'];
					if (!(reqGarageName in garages)){
						if (typeof reqGarageType.resolutions !== 'undefined'){
							const garageSlotResolved = reqGarageType.resolutions.resolutionsPerAuthority[0].values[0];
							reqGarageName = garageSlotResolved.value.name;
						} else {
							var closestGarage = stringSimilarity.findBestMatch(reqGarageName, garages)['bestMatch']['target'];
							reqGarageName = closestGarage;
						}
					}

					// CAIN: counts[0] CCG:  counts[1] UCG:  counts[2] WCG:  counts[3]
					// We could be doing this better, aka using the Resolved Slot's ID, but 
					// if we do it here then people can add garages easily.
					var count_idx = -1;
					if (reqGarageName === 'Cain Garage'){
						count_idx = 0;
					} else if (reqGarageName === 'Central Campus Garage'){
						count_idx = 1;
					} else if (reqGarageName === 'University Center Garage'){
						count_idx = 2;
					} else if (reqGarageName === 'West Campus Garage'){
						count_idx = 3;
					}

					this.response.speak(reqGarageName+' has '+counts[count_idx]+' spots left.');;
					this.response.cardRenderer('alexa-tamu', reqGarageName+' has '+counts[count_idx]+' spots left.');
					this.emit(':responseReady');
				}			
			});
		}
	},
	'GetLocationIntent' : function(){
		var location_slot = this.event.request.intent.slots.Location;
		var location_name = location_slot.value;
		if (!(location_name in this.t('LOCATIONS'))){
			if (typeof location_slot.resolutions !== 'undefined'){
				const location_slot_resolved = location_slot.resolutions.resolutionsPerAuthority[0].values[0];
				location_name = location_slot_resolved.value.name;
			} else {
				var closest_key = stringSimilarity.findBestMatch(location_name, Object.keys(this.t('LOCATIONS')))['bestMatch']['target'];
				location_name = closest_key;
			}
		}

		var cardTitle = this.t('DISPLAY_CARD_TITLE', this.t('SKILL_NAME'), location_name);
		var cur_locations = this.t('LOCATIONS');
		var location_info = cur_locations[location_name];

		if (location_info){
			var url = "https://aggiemap.tamu.edu/?bldg="+location_info["url"];
			request(url, (err, res, body) => {
				if (!err && res.statusCode === 200){
					const $ = cheerio.load(body);

					// soooo cheerio doesn't run JS. we'd need PhantomJS for this
					// var canvas = $('.esri-display-object')[0];
					// console.log("Found canvas at "+canvas.toDataURL());

					var speechOutput = "I've sent you a screenshot of the location of ${location_name} on AggieMap.";
					this.attributes.speechOutput = speechOutput;
					this.attributes.repromptSpeech = this.t('DEF_REPEAT_MESSAGE');

					this.response.speak(speechOutput).listen(this.attributes.repromptSpeech);
					this.response.cardRenderer(cardTitle, url);
					this.emit(':responseReady');
				}
			});
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
		// This is where we'd add
		// this.event.request -> DynamoDB
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
