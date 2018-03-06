var fs = require('fs');
var http = require('http');
var https = require('https');
var key =  fs.readFileSync('server-key.pem', 'utf8');
var cert = fs.readFileSync('server-crt.pem', 'utf8');
var ca = fs.readFileSync('ca-crt.pem', 'utf8');

var creds = { key: key, cert: cert, ca: ca };
var express = require("express");
var app = express();

app.get('/', function(req, res){
	res.send('hello');
});

// var alexa = require('./server-alexa-instance.js');

// var http_server = http.createServer(app);
var https_server = https.createServer(creds, app);

// http_server.listen(65501);
https_server.listen(65500, function(req, res){
	console.log("server running");
});

var path = require("path");
var useragent = require('useragent');

// console.log(alexa.);
// app.use(express.static('src'));

// http_server.on('/', function(req, res){
// 	res.sendFile(path.join(__dirname + '/index.html'));
// 	var agent = useragent.parse(req.headers['user-agent']);
// 	console.log(req.headers);
// })

// app.get('/', function(req, res){
// 	res.send('hello');
	// res.sendFile(path.join(__dirname + '/index.html'));
	// var agent = useragent.parse(req.headers['user-agent']);
	// console.log(req.headers);
// })

// app.post('/', function(req, res){
// 	console.log(req.body);
// 	// res.sendFile(path.join(__dirname + '/index.html'));
// 	var agent = useragent.parse(req.headers['user-agent']);
// 	console.log(req.headers);
// })