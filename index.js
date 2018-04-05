// SSML
const Speech = require('ssml-builder');

// string manipulation
const stringSimilarity = require('string-similarity');
const stringifyObject = require('stringify-object');

// General Alexa
//	* Intents
//  * Custom slot types 😮😳🐫
const Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.82534c6d-52ef-4742-90f3-1945c616832f';

// Static Content
const definitions = require('data/definitions');
const locations = require('data/locations');

// Dynamic Content
const request = require('request');
const requestjson = require('request-json');
const requestserver = requestjson.createClient('http://localhost:8888/')
const cheerio = require('cheerio'); // DOM Parser

// util
const moment = require('moment-timezone'); // Timestamps
const _ = require('lodash'); // Functional Library
const fs = require('fs'); // filesystem

// Database
const dynamo = require('dynamodb');

if (fs.existsSync('data/data/dynamodb_credentials')){
	// exposed creds?
	dynamo.AWS.config.loadFromPath('data/dynamodb_credentials');
	dynamo.AWS.config.update({region: 'us-east-1'});
} else {
	console.log('dynamo credentials not present! ask joey for the key!');
}

const languageStrings = {
	'en': {
		translation: {
			DEFINITION_LANG: 'en-us',
			HELPDESK_LANG: 'en-us',
			LOCATIONS: locations.LOCATION_EN_US,
			SKILL_NAME: 'alexa-tamu',
			DISPLAY_CARD_TITLE: '%s',
			STOP_MESSAGE: 'Goodbye!',
			DEF_READOUT: 'The requested definition of ',
			DEF_NOT_FOUND: 'I\'m sorry, I don\'t know what ',
			HELPDESK_NOT_FOUND: 'I\'m sorry, I can\'t help you with that. Please visit hdc.tamu.edu'
		},
	},
	'en-us' : {
		translation: {
			DEFINITION_LANG: 'en-us',
			LOCATIONS: locations.LOCATION_EN_US,
			SKILL_NAME: 'alexa-tamu',
		},
	},
};

const handlers = {
	'LaunchRequest': function(){
		var speech = new Speech();
		speech.say('Welcome to Texas A&M University\'s Alexa dev app! Visit alexa.tamu.edu for more info.');
		var s = speech.ssml(true);

		this.attributes.outputSpeech = s;
		this.attributes.repromptSpeech = 'Please visit alexa.tamu.edu to learn more.';

		this.response.speak(this.attributes.outputSpeech).listen(this.attributes.repromptSpeech);
		this.emit(':responseReady');
	},
	'getExternalScriptIntent' : function(){
		var reqScript = this.event.request.intent.slots.ScriptName.value;
		var reqArgs = this.event.request.intent.slots.ScriptArgs.value;
		// var reqType = this.event.request.intent.slots.SportType.value;

		var s = require('intents/'+reqScript);
		var res = s.getSportsPage(reqArgs);

		this.response.speak('getExternalScriptIntent('+reqArgs+') -> '+res);
		this.response.cardRenderer('alexa-tamu', 'getExternalScriptIntent('+reqArgs+') -> '+res);
		this.emit(':responseReady');
	},
	'GetSportsInfoIntent' : function(){
		// TODO: reqRivalTeam
		var reqSportType = this.event.request.intent.slots.SportType;
		var reqRivalTeam = this.event.request.intent.slots.RivalTeam;
		if (!reqSportType.value){
			const slotToElicit = 'SportType';
			const speechOutput = 'What sport would you like to hear about?';
			this.emit(':elicitSlot', slotToElicit, speechOutput, speechOutput);
		} else {
			reqSportType = reqSportType.value;

			var speechOutput = '';
			var cardOutput = '';
			var todayDate = moment().tz('America/Rainy_River').format('MM/DD/YYYY');
			var url = 'http://12thman.com/services/responsive-calendar.ashx?type=events&sport=0&date='+todayDate;
			requestserver.get(url, (err, res, body) => {
				if (!err && res.statusCode == 200){

					// The schedule has 6 days, with each day item
					// holding (potentially) multiple events.
					var schedule = body;
					for (var day in schedule){

						var date = moment(schedule[day].date).format('MMM Do, YYYY');
						var all_events = schedule[day].events
						console.log('all_events:');
						if (all_events === [] || all_events === null){
							console.log(all_events);
							break;
						}
						for (var event of all_events) {

							// Logistics
							var date = moment(event.date).format('MMMM Do, YYYY');
							var hour = moment(event.date).format('hh:mma');
							var time = event.time;
							var is_conference_game = event.conference;
							var location = event.location;
							var at_vs = event.at_vs;
							var venue = event.facility;

							// Opponent info and image
							var opponent = event.opponent;
							var opponent_name = opponent.title;
							var opponent_location = opponent.location;
							var opponent_mascot = opponent.mascot;
							var opponent_image = null;

							var radio = event.media.radio;
							var tv = event.media.tv;
							var tickets = event.media.tickets;

							// We say the first seen game, then otherwise just put it in the card object
							if (event.sport.shortname.includes(reqSportType)){
								if (speechOutput === ''){
									if (typeof venue.title !== 'undefined'){
										speechOutput = 'Our next '+reqSportType+' game is against '+opponent_name+' at '+venue.title+', '+location+' on '+date+' at '+time+'!';
									} else {
										speechOutput ='Our next '+reqSportType+' against '+opponent_name+' at '+venue+', '+location+' on '+date+' at '+time+'!';
									}
									cardOutput += opponent_name+' @ '+location+', '+time+' on '+date+'\n\n';
								} else {
									if (speechOutput.slice(-1) == '!'){
										// means there's more than one game!
										speechOutput += ' There are more games that I\'ve sent to your Alexa application.';
									}
									cardOutput += opponent_name+' @ '+location+', '+time+' on '+date+'\n\n';
								}
							}
						}

					}
					if (speechOutput){
						this.response.speak(speechOutput);
						this.response.cardRenderer(`alexa-tamu: ${_.capitalize(reqSportType)} Schedule`, cardOutput);
					} else {
						this.response.speak('I can\'t seem to find any '+reqSportType+' games in the next week.');

					}
					this.emit(':responseReady');

				} else {
					this.response.speak('That request failed!');
					// this.response.cardRenderer('alexa-tamu'+reqSportType, 'Error');
					this.emit(':responseReady');
				}
			});


		}
	},
	'GetDefinitionIntent' : function(){
		var defSlot = this.event.request.intent.slots.Definition;
		var defName = defSlot.value;

		var s = require('intents/getDefinition.js');

		if (typeof defSlot.resolutions !== 'undefined' && defSlot.resolutions.resolutionsPerAuthority[0].status.code != 'ER_SUCCESS_NO_MATCH'){
			const defSlotResolved = defSlot.resolutions.resolutionsPerAuthority[0].values[0];
			defName = defSlotResolved.value.name;
		}

		var def = s.getDefinition(defName, this.t('DEFINITION_LANG'));

		if (def){
			var speechOutput = this.t('DEF_READOUT')+defName+' is '+def;
			var repromptSpeech = speechOutput;

			this.response.speak(speechOutput).listen(repromptSpeech);
			this.response.cardRenderer('alexa-tamu: '+defName, def);
			this.emit(':responseReady');
		} else {
			var speechOutput = this.t('DEF_NOT_FOUND');
			if (defName){
				speechOutput += defName;
			} else {
				speechOutput += ' that';
			}
			speechOutput += ' is.';
			var repromptSpeech = speechOutput;

			this.response.speak(speechOutput).listen(repromptSpeech);
			this.emit(':responseReady');
		}
	},
	'GetHelpdeskIntent' : function(){
		var helpdeskPhraseSlot = this.event.request.intent.slots.HelpdeskPhrase;
		var helpdeskPhrase = helpdeskPhraseSlot.value;

		if (typeof helpdeskPhraseSlot.resolutions !== 'undefined' && helpdeskPhraseSlot.resolutions.resolutionsPerAuthority[0].status.code != 'ER_SUCCESS_NO_MATCH'){
			const helpdeskSlotResolved = helpdeskPhraseSlot.resolutions.resolutionsPerAuthority[0].values[0];
			helpdeskPhrase = helpdeskSlotResolved.value.name;
		}

		var helpdeskDict = require('intents/getHelpdesk.js');
		var helpdeskResponse = helpdeskDict.getHelpdesk(helpdeskPhrase, this.t('HELPDESK_LANG'));

		if (helpdeskResponse){
			var speechOutput = helpdeskResponse;
			var repromptSpeech = speechOutput;

			this.response.speak(speechOutput).listen(repromptSpeech);
			this.response.cardRenderer('alexa-tamu: '+helpdeskPhrase, helpdeskResponse);
			this.emit(':responseReady');
		} else {
			var speechOutput = this.t('HELPDESK_NOT_FOUND');
			var repromptSpeech = speechOutput;

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
					Array.from($('.count > .badge')).forEach(element => {
						counts.push(_.trim(element.children[0].data));
					});

					// We could be doing this better, aka using the Resolved Slot's ID, but
					// if we do it here then people can add garages easily.
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

					// CAIN: 0, CCG: 1, UCG: 2, WCG: 3
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

					var currentTime = moment().tz('America/Rainy_River').format('h:m a');
					var cardContent = reqGarageName+' has '+counts[count_idx]+' spots open as of '+currentTime+'.';

					this.response.speak(reqGarageName+' currently has '+counts[count_idx]+' spots open.');
					this.response.cardRenderer('alexa-tamu: '+reqGarageName, cardContent);
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
		var cur_locations = this.t('LOCATIONS');
		var location_info = cur_locations[location_name];

		if (location_info){
			var url = 'https://aggiemap.tamu.edu/?bldg='+location_info['url'];
			request(url, (err, res, body) => {
				if (!err && res.statusCode === 200){
					const $ = cheerio.load(body);

					// soooo cheerio doesn't run JS. we'd need PhantomJS for this
					// var canvas = $('.esri-display-object')[0];
					// console.log('Found canvas at '+canvas.toDataURL());

					var speechOutput = 'I\'ve sent you a screenshot of the location of '+location_name+' on AggieMap.';
					this.attributes.speechOutput = speechOutput;
					this.attributes.repromptSpeech = 'I said that '+speechOutput;

					// this.response.speak(speechOutput).listen(this.attributes.repromptSpeech);
					this.response.cardRenderer('alexa-tamu: '+location_name, 'Type the following url into your browser:'+url);
					this.emit(':responseReady');
				}
			});
		} else {
			var speechOutput = 'I\'m not sure where ';
			if (location_name){
				// dynamodb for missed locations here!
				speechOutput += location_name;
			} else {
				speechOutput += 'that '
			}
			speehchOutput += 'is.';

			this.attributes.speechOutput = speechOutput;
			this.attributes.repromptSpeech = 'I said that'+speechOutput;

			this.response.speak(speechOutput).listen(repromptSpeech);
			this.response.cardRenderer('alexa-tamu: '+location_name, 'Error finding requested location!');
			this.emit(':responseReady');
		}
	},
	'GetBusStatusIntent' : function(){
		var reqBusStatusType = this.event.request.intent.slots.BusNumber;
		if (typeof reqBusStatusType === 'undefined' || !reqBusStatusType.value){
			const slotToElicit = 'BusNumber';
			const speechOutput = 'What bus route would you like to hear about?';
			this.emit(':elicitSlot', slotToElicit, speechOutput, speechOutput);
		} else {
			reqBusRoute = reqBusStatusType.value;
			var speechOutput = '';
			console.log('here');
			var url = `http://transport.tamu.edu/BusRoutesFeed/api/route/${reqBusRoute}/buses/mentor?request`;
			var timeNow = moment().tz('America/Chicago').format();
			request(url, (err, res, body) => {
				// this gives us back an xml object.
				// parse it pls
				console.log('there');
				try {
					var Canvas = require('canvas');
					var new_canvas = new Canvas(200, 200);
					var ctx = new_canvas.getContext('2d');
					buses = JSON.parse(body);
					var busAmount = 0;
					var speechOutput = `I didn't see any buses on your route right now!`;
					buses.forEach(bus => {
						console.log(bus);
						var estimatedTime = moment(bus.NextStops[0].EstimatedDepartTime);
						var durToNextStop = moment.duration(estimatedTime.diff(timeNow)).asMinutes();
						speechOutput = 'You\'ll see a bus in '+durToNextStop;
						busAmount++;
					});
					const imageObj = {
						smallImageUrl: ctx.getDataURL(),
						largeImageUrl: 'https://imgs.xkcd.com/comics/standards.png'
					};
					this.attributes.speechOutput = speechOutput;
					this.attributes.repromptSpeech = 'I said that '+speechOutput;

					// this.response.speak(speechOutput).listen(this.attributes.repromptSpeech);
					this.response.cardRenderer(`alexa-tamu: Route ${reqBusRoute}`, `Buses on Route: ${busAmount}`, imageObj);
					this.emit(':responseReady');

				} catch (err) {
					//console.log('error');
				}

			});
		}
	},
	'GetCollegeIntent' : function(){
		this.response.speak('GetCollegeIntent!');
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
		this.response.speak('Goodbye!');
		this.emit(':responseReady');
	},
	'AMAZON.CancelIntent': function () {
		this.response.speak('Goodbye!');
		this.emit(':responseReady');
	},
	'SessionEndedRequest': function () {
		console.log(`Session ended: ${this.event.request.reason}`);
    },
	'Unhandled': function () {
		// This is where we'd add
		// this.event.request -> DynamoDB
		var Unhandled_Queries_Table = dynamo.define('Unhandled_Queries', {
			hashKey : 'ID',
			timestamps : true,
			schema : {
				ID : dynamo.types.string,
				query: dynamo.types.string,
			}
		});
		Unhandled_Queries_Table.create({
							ID: 'yo what it do',
							query: stringifyObject(this.event.request, {
								indent: '  ',
								singleQuotes: true
							})
						   });
		this.attributes.speechOutput = 'I can\'t currently answer that, but I\'ve stored your request in a database.';
		this.attributes.repromptSpeech = 'Check out alexa.tamu.edu for more information.';
		this.emit(':responseReady');
	},
};

exports.handler = function (event, context, callback) {
	const alexa = Alexa.handler(event, context, callback);
	alexa.appId = APP_ID;
	// To enable string internationalization (i18n) features, set a resources object.
	alexa.resources = languageStrings;
	alexa.registerHandlers(handlers);
	alexa.execute();
};
