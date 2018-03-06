var express = require('express');
var app = express();

// Web sockets!
var server = require('http').Server(app);
var io = require('socket.io')(Server);

// Extra/io
var path = require('path');
var useragent = require('useragent');
// Useragent upgrade
