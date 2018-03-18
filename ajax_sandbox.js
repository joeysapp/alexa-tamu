'GetSportsInfoIntent': function(){
	// will lambda let us do this?
	// aka reload this file every time? lol
	var dynamicSportsInfo = requires('data/sports.js');

	var requestedSportType = this.event.request.intent.slots.SportType;
	// must be valid for queryURL, aka baseball/soccer/...
	var requestedSportName = requestedSportType.value;

	var cardTitle = this.t('Aggie '+requestedSportName);
	var cardContent = this.t('SPORTS_CARD_INFORMATION');

	var replyObject = dynamicSportsInfo[requestedSportName];

	var urlToQuery = "https://www.12thmanfoundation.com/ticket-center/sport/${requestedSportName}";

	const resultOfQuery = await $.ajax({
		url: urlToQuery,
		type: 'post',
		data: null
	});
	console.log(resultOfQuery);
	// var timeUntilNextGame = {};

	var replyBack = "It looks like the next Aggie "+requestedSportName+" is in "+timeUntilNextGame;

	this.response.speak(replyBack).listen(this.attributes.repromptSpeech);
	this.response.cardRenderer(cardTitle, cardContent);
}
