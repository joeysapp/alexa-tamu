var express = require("express");
var alexa = require("alexa-app");

var PORT = process.env.port || 65500;
var app = express();

// ALWAYS setup the alexa app and attach it to express before anything else.
var alexaApp = new alexa.app("alexa-tamu");
var path = require("path");
var useragent = require('useragent');

alexaApp.express({
	expressApp: app,
	checkCert: false,

	// sets up a GET route when set to true. This is handy for testing in
	// development, but not recommended for production. disabled by default
	debug: true
});

// now POST calls to /test in express will be handled by the app.request() function

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname + '/index.html'));
	var agent = useragent.parse(req.headers['user-agent']);
	console.log(req.headers);
})

app.post('/', function(req, res){
	console.log(req.body);

})
// from here on you can setup any other express routes or middlewares as normal
app.set("view engine", "ejs");

alexaApp.launch(function(request, response) {
	// Session
	response.say("Welcome to Texas A and M University's Alexa app!");
});

alexaApp.dictionary = { "LIST_OF_DEFS": [
									'information technology',
									'yell leaders',
									'twelfth man',
									'corps of cadets',
									'corps',
									'cadets',
									'aggie',
									'gig em',
									'gig',
									'johnny manziel',
									'tamu',
									'a and m',
									'reveille',
									'football team',
									'soccer team',
									'basketball team',
									'baseball team',
									'cycling team',
									'lacrosse team',
									'RUF'
									] 
					};

alexaApp.intent("GetDefinition", {
	"slots": { 
		"Definition": "LIST_OF_DEFS" 
	},
	"utterances": [
	  "what does {Definition} mean",
	  "what's {Definition}",
	  "tell me {Definition}",
	  "give me {Definition}",
	  "get me {Definition}",
	  "get {Definition}",
	  "find {Definition}",
	  "find me {Definition}",
	  "who is {Definition}",
	  "tell me about {Definition}",
	  "tell me about the {Definition}",
	  "who are the {Definition}",
	  "who is on the {Definition}",
	  "who is in {Definition}",
	  "who is the president of {Definition}",
	]
},
	function(request, response) {
		console.log(request)
		response.say("Success!");
	}
);

app.listen(PORT);
console.log("Listening on port " + PORT + ", try http://localhost:" +PORT);