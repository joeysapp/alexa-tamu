	'GetLocationIntent' : function(){
		var locationSlot = this.event.request.intent.slots.Location;
		var locationName = locationSlot.value;

		// Using Alexa's 'Slot Resolution' we can easily
		// validate (and log) and mis-matched 
		if (typeof locationSlot.resolutions !== 'undefined' && locationSlot.resolutions.resolutionsPerAuthority[0].status.code != 'ER_SUCCESS_NO_MATCH'){
			const locationSlotResolved = locationSlot.resolutions.resolutionsPerAuthority[0].values[0];
			locationName = locationSlotResolved.value.name;
		}

		var locationDict = require('intents/getLocation.js');
		var locationResponse = locationDict.getLocation(locationName, this.t('LOCATION_LANG'), function(data){
			// So 'data' here is the returned value from intents/getLocation.js.
			// but we defined the function in that file to take a callback,
			// and this block of code is that callback
			var speechOutput = 'u shoudl never see dis';
			if (data.didRespond){
				speechOutput = data.speechOutput;
				// reasoning for this is that
				// we shoudl only be sending a card object
				// if we properly found the location.
				// arguably we could send a 'We've logged your request for [locationSlot] to our Missed_Queries db'
				this.response.cardRenderer('alexa-tamu: '+locationName, cardContent);
			} else {
				// @ JACK
				// Do database logging here

				speechOutput = this.t('LOCATION_NOT_FOUND');
			}
			var repromptSpeech = speechOutput;
			this.response.speak(speechOutput).listen(repromptSpeech);
			this.emit(':responseReady');
		});
	},