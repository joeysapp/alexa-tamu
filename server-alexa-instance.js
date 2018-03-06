var fs = require('fs');
var http = require('http');
var https = require('https');
var p_key =  fs.readFileSync('sslcert/server.key', 'utf8');
var cert = fs.readFileSync('sslcert/server.crt', 'utf8');

var creds = { key: p_key, cert: cert };
var express = require("express");
var app = express();

var alexa = require('./server-alexa-instance.js');

var http_server = https.createServer(app);
var https_server = https.createServer(creds, app);

http_server.listen(65500);
https_server.listen(65500);

var path = require("path");
var useragent = require('useragent');

// console.log(alexa.);
// app.use(express.static('src'));

// app.get('/', function(req, res){
// 	res.sendFile(path.join(__dirname + '/index.html'));
// 	var agent = useragent.parse(req.headers['user-agent']);
// 	console.log(req.headers);
// })

// app.post('/', function(req, res){
// 	console.log(req.body);
// 	// res.sendFile(path.join(__dirname + '/index.html'));
// 	var agent = useragent.parse(req.headers['user-agent']);
// 	console.log(req.headers);
// })