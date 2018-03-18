'GetSportsInfoIntent': function(){
	// will lambda let us do this?
	// aka reload this file every time? lol
	var dynamicSportsInfo = requires('data/sports.js');

	var requestedSportType = this.event.request.intent.slots.SportType;
	// must be valid for queryURL, aka baseball/soccer/...
	var requestedSportName = requestedSportType.value;

	var cardTitle = this.t('Aggie '+requestedSportName);


	// OOooooo this could actually be like dynamicSportsInfo too, and we could render
	// images of where to go on a map to put in the card.. dunno if the above 'requires'
	// will actually work tho.
	var cardContent = this.t('SPORTS_CARD_INFORMATION');

	var replyObject = dynamicSportsInfo[requestedSportName];
	// cardContent = replyObject.dynamicCardContent;

	// or, just do it out here. cause it's better to abstract this away to separate files right?

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
