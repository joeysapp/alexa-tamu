var express = require("express");
var app = express();

var server = require('https').Server(app);
var alexa = require('./server-alexa-instance.js');

var PORT = process.env.port || 65500;
var path = require("path");
var useragent = require('useragent');

server.listen(process.env.PORT || 65500);
app.use(express.static('src'));

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname + '/index.html'));
	var agent = useragent.parse(req.headers['user-agent']);
	console.log(req.headers);
})

app.post('/', function(req, res){
	console.log(req.body);
	// res.sendFile(path.join(__dirname + '/index.html'));
	var agent = useragent.parse(req.headers['user-agent']);
	console.log(req.headers);
})