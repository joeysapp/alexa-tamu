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
			LOCATION_LANG: 'en-us',
			SKILL_NAME: 'alexa-tamu',
			DISPLAY_CARD_TITLE: '%s',
			STOP_MESSAGE: 'Goodbye!',
			DEF_READOUT: 'The requested definition of ',
			DEF_NOT_FOUND: 'I\'m sorry, I don\'t know what ',
			HELPDESK_NOT_FOUND: 'I\'m sorry, I can\'t help you with that. Please visit hdc.tamu.edu. Your request has been logged to help with the skill\'s development.',
			LOCATION_NOT_FOUND: 'I\'m sorry, I can\'t find that location. Please visit aggiemap.tamu.edu. Your request has been logged to help with the skill\'s development.',
			BUS_NOT_FOUND: 'I\'m sorry, I can\'t find that bus. Your request has been logged to help with the skill\'s development.',
			REC_NOT_FOUND: 'I\'m sorry, the Recreation Center currently does not offer that. Your request has been logged to help with the skill\'s development.'
		},
	},
	'en-us' : {
		translation: {
			DEFINITION_LANG: 'en-us',
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
	'GetRecIntent' : function(){
		var recSlot = this.event.request.intent.slots.RecInfo;
		var recName = recSlot.value;

		if (typeof recSlot.resolutions !== 'undefined' && recSlot.resolutions.resolutionsPerAuthority[0].status.code != 'ER_SUCCESS_NO_MATCH'){
		 	const recSlotResolved = recSlot.resolutions.resolutionsPerAuthority[0].values[0];
		 	recName = recSlotResolved.value.name;
		}

		var timeNow = moment().tz('America/Chicago');
		//Keep these updated with most current open and close times
		var open = [12, 6, 6, 6, 6, 6, 8];
		//24 == 12 AM, for algorithmic reasons
		var close = [24, 24, 24, 24, 24, 23, 23];
		var open_fmt = ["12 PM", "6 AM", "6 AM", "6 AM", "6 AM", "6 AM", "8 AM"];
		var close_fmt = ["12 AM", "12 AM", "12 AM", "12 AM", "12 AM", "11 PM", "11 PM"]
		var name_of_day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var schedule = '';
		for(var i = 0; i < name_of_day.length; ++i){
			schedule += name_of_day[i] + ": " + open_fmt[i] + " - " + close_fmt[i] + "\n";
		}

		var outputSpeech = '';
		var day = timeNow.day();
		var hour = timeNow.hour();

		if(recName == "today" || recName == "right now" || recName == "open"){
			if(hour >= open[day] && hour < close[day]){
				outputSpeech = "The recreational facilities are currently open from now until " + close_fmt[day] + ". I have sent the current rec hours to your Alexa application.";
			}else{
				outputSpeech = "The recreational facilities are currently closed. ";
				if(hour < open[day]){
					outputSpeech += "The rec center opens at ";
					if(day == 0){
						outputSpeech += open_fmt[day] + " on " + name_of_day[day] + "s.";
					}else if(day < 6){
						outputSpeech += open_fmt[day] + " on " + name_of_day[day] + "s.";
					}else{
						outputSpeech += open_fmt[day] + " on " + name_of_day[day] + "s.";
					}
				}else if(hour >= close[day]){
					outputSpeech += "The rec center will open at ";
					if(day == 5){
						outputSpeech += open_fmt[day + 1] + " on " + name_of_day[day + 1] + ".";
					}else{
						outputSpeech += open_fmt[0] + " on " + name_of_day[0] + ".";
					}
				}
			}
		}else if(recName == "this week"){
			//Keep schedule var updated with the most current schedule.
			if(schedule){
				outputSpeech = "The recreational facilities are open this week. I have sent the current rec hours to your Alexa application.";
			}else{
				outputSpeech = "The recreational facilites are currently closed.";
			}
		}else if(recName == "this weekend"){
			outputSpeech += "This weekend, the recreational facilities will be open on " + name_of_day[6];
			outputSpeech += " from " + open_fmt[6] + " until " + close_fmt[6] + " and on " + name_of_day[0];
			outputSpeech += " from " + open_fmt[0] + " until " + close_fmt[0] + ".";
		}else if(recName == "Monday" || recName == "Tuesday" || recName == "Wednesday" ||
			recName == "Thursday" || recName == "Friday" || recName == "Saturday" || recName == "Sunday"){
				var index = name_of_day.indexOf(recName);
				outputSpeech = "The recreational facilities are open on " + name_of_day[index] +
					" from " + open_fmt[index] + " until " + close_fmt[index] + ".";
		}else{
			var s = require('intents/getRecInfo.js');

			var def = s.getRecInfo(recName, this.t('DEFINITION_LANG'));

			if(def){
				var speechOutput = def;
				var repromptSpeech = speechOutput;

				this.response.speak(speechOutput).listen(repromptSpeech);
				this.response.cardRenderer('alexa-tamu: '+recName, def);
				this.emit(':responseReady');
			} else {
				var speechOutput = this.t('REC_NOT_FOUND');
				var repromptSpeech = speechOutput;

				this.response.speak(speechOutput).listen(repromptSpeech);
				this.emit(':responseReady');
			}
		}

		var repromptSpeech = outputSpeech;
		this.response.speak(outputSpeech).listen(repromptSpeech);
		this.response.cardRenderer('alexa-tamu: current rec schedule:', schedule);
		this.emit(':responseReady');

	},
	'GetSportsInfoIntent' : function(){
		// TODO: reqRivalTeam
		var reqSportTypeSlot = this.event.request.intent.slots.SportType;
		var reqRivalTeam = this.event.request.intent.slots.RivalTeam;
		if (!reqSportTypeSlot.value){
			const slotToElicit = 'SportType';
			const speechOutput = 'What sport would you like to hear about?';
			this.emit(':elicitSlot', slotToElicit, speechOutput, speechOutput);
		} else {
			var reqSportType = reqSportTypeSlot.value;

			if (typeof reqSportTypeSlot.resolutions !== 'undefined' && reqSportTypeSlot.resolutions.resolutionsPerAuthority[0].status.code != 'ER_SUCCESS_NO_MATCH'){
				const reqSportTypeResolved = reqSportTypeSlot.resolutions.resolutionsPerAuthority[0].values[0];
				reqSportType = reqSportTypeResolved.value.name;
			}

			var speechOutput = '';
			var cardOutput = '';
			var todayDate = moment().tz('America/Rainy_River').format('MM/DD/YYYY');
			var url = 'http://12thman.com/services/responsive-calendar.ashx?type=events&sport=0&date='+todayDate;
			console.log(url)
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
							continue;
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
			speechOutput += ' is. Your request has been logged to help with the skill\'s development.';
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
		var locationSlot = this.event.request.intent.slots.Location;
		var locationName = locationSlot.value;

		if (typeof locationSlot.resolutions !== 'undefined' && locationSlot.resolutions.resolutionsPerAuthority[0].status.code != 'ER_SUCCESS_NO_MATCH'){
			const locationSlotResolved = locationSlot.resolutions.resolutionsPerAuthority[0].values[0];
			locationName = locationSlotResolved.value.name;
		}

		var locationDict = require('intents/getLocation.js');
		var locationResponse = locationDict.getLocation(locationName, this.t('LOCATION_LANG'));

		if (locationResponse){
			var url_id = locationResponse['url']
			var spoken_id = locationResponse['id'];
			var url = 'https://aggiemap.tamu.edu/?bldg='+url_id;
			request(url, (err, res, body) => {
				if (!err && res.statusCode === 200){
					// const $ = cheerio.load(body);
					var speechOutput = `I\'ve sent you the URL of the location of ${locationName} on AggieMap.`;
					var repromptSpeech = speechOutput;

					this.response.speak(speechOutput).listen(repromptSpeech);
					this.response.cardRenderer('alexa-tamu: '+locationName, url);
					this.emit(':responseReady');
				}
			});
		} else {
			var speechOutput = this.t('LOCATION_NOT_FOUND');
			var repromptSpeech = speechOutput;

			this.response.speak(speechOutput).listen(repromptSpeech);
			this.emit(':responseReady');
		}
	},
	'GetBusStatusIntent' : function(){
		var busSlot = this.event.request.intent.slots.BusNumber;
		var reqBusRoute = busSlot.value;

		if (typeof busSlot.resolutions !== 'undefined' && busSlot.resolutions.resolutionsPerAuthority[0].status.code != 'ER_SUCCESS_NO_MATCH'){
			const busSlotResolved = busSlot.resolutions.resolutionsPerAuthority[0].values[0];
			reqBusRoute = busSlotResolved.value.name;
		}else if(busSlot.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_NO_MATCH'){
			var speechOutput = this.t('BUS_NOT_FOUND');
			var repromptSpeech = speechOutput;

			this.response.speak(speechOutput).listen(repromptSpeech);
			this.emit(':responseReady');
		}

	 	if(reqBusRoute){
			var speechOutput = '';
			console.log('here');
			var url = `http://transport.tamu.edu/BusRoutesFeed/api/route/${reqBusRoute}/buses/mentor?retmode=xml`;
			var timeNow = moment().tz('America/Chicago');
			request(url, (err, res, body) => {
				// this gives us back an xml object.
				// parse it pls

				var buses = JSON.parse(body);

				if(buses.length < 1){
					var speechOutput = "There are currently no buses active on route " + reqBusRoute + ".";
					var repromptSpeech = speechOutput;
					this.response.speak(speechOutput).listen(repromptSpeech);
					this.emit(':responseReady');
				}

				var speechOutput = "Bus route " + reqBusRoute + " will be stopping at: \n";
				var cardOutput = "The next stops for the route " + reqBusRoute + " buses are: \n";

				for(var i = 0; i < buses.length; ++i){
					var stopName = buses[i]["NextStops"][0]["Name"];
					var stopEstTime = moment(buses[i]["NextStops"][0]["EstimatedDepartTime"]).tz('America/Chicago').format('h:mm:ss a');
					var methodStopEst = moment(buses[i]["NextStops"][0]["EstimatedDepartTime"]).tz('America/Chicago');

					var difference = Math.round(moment.duration(methodStopEst.diff(timeNow)).asMinutes());

					if(difference <= 1){
						difference = "less than one minute";
					}else{
						difference += " minutes";
					}

					// Let's make this have a pretty output. #DesigningForVoice
					var speechOutputToAppend = "";
					if(i == (buses.length - 1) && i != 0){
						speechOutputToAppend = "and " + stopName + " in " + difference + ".\n";
					}else if(i == (buses.length - 1) && i == 0){
						speechOutputToAppend = stopName + " in " + difference + ".\n";
					}else{
						speechOutputToAppend = stopName + " in " + difference + ", \n";
					}

					console.log(speechOutputToAppend);
					var cardOutputToAppend = '\t' + stopName + '\t\t' + stopEstTime + '\n';

					speechOutput += speechOutputToAppend;
					cardOutput += cardOutputToAppend;
				}

				speechOutput += "\nI have sent the estimated arrival times to your Alexa application.";
				var repromptSpeech = speechOutput;
				this.response.speak(speechOutput).listen(repromptSpeech);
				this.response.cardRenderer('alexa-tamu: Bus Route ' + reqBusRoute + ' next stops:', cardOutput);
				this.emit(':responseReady');

				// console.log('there');
				// try {
				// 	var Canvas = require('canvas');
				// 	var new_canvas = new Canvas(200, 200);
				// 	var ctx = new_canvas.getContext('2d');
				// 	buses = JSON.parse(body);
				// 	var busAmount = 0;
				// 	var speechOutput = `I didn't see any buses on your route right now!`;
				// 	buses.forEach(bus => {
				// 		console.log(bus);
				// 		var estimatedTime = moment(bus.NextStops[0].EstimatedDepartTime);
				// 		var durToNextStop = moment.duration(estimatedTime.diff(timeNow)).asMinutes();
				// 		speechOutput = 'You\'ll see a bus in '+durToNextStop;
				// 		busAmount++;
				// 	});
				// 	const imageObj = {
				// 		smallImageUrl: ctx.getDataURL(),
				// 		largeImageUrl: 'https://imgs.xkcd.com/comics/standards.png'
				// 	};
				// 	this.attributes.speechOutput = speechOutput;
				// 	this.attributes.repromptSpeech = 'I said that '+speechOutput;
				//
				// 	// this.response.speak(speechOutput).listen(this.attributes.repromptSpeech);
				// 	this.response.cardRenderer(`alexa-tamu: Route ${reqBusRoute}`, `Buses on Route: ${busAmount}`, imageObj);
				// 	this.emit(':responseReady');
				//
				// } catch (err) {
				// 	//console.log('error');
				// }

			});
		}else{
			var speechOutput = this.t('BUS_NOT_FOUND');
			var repromptSpeech = speechOutput;

			this.response.speak(speechOutput).listen(repromptSpeech);
			this.emit(':responseReady');
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
		// var Unhandled_Queries_Table = dynamo.define('Unhandled_Queries', {
		// 	hashKey : 'ID',
		// 	timestamps : true,
		// 	schema : {
		// 		ID : dynamo.types.string,
		// 		query: dynamo.types.string,
		// 	}
		// });
		// Unhandled_Queries_Table.create({
		// 					ID: 'yo what it do',
		// 					query: stringifyObject(this.event.request, {
		// 						indent: '  ',
		// 						singleQuotes: true
		// 					})
		// 				   });
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
