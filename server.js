var http = require('http');
var express = require('express');
var app = require('express').createServer();
app.use(express.static(__dirname + '/public', { maxAge: 14 * 24 * 60 * 60 * 1000 }));
app.listen(80);

var nowjs = require("now");
var everyone = require("now").initialize(app);

var winston = require('winston');
var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: 'wtfref.log' })
	],
	exceptionHandlers: [
		new (winston.transports.File)({ filename: 'exceptions.log'})
	]
});

logger.handleExceptions();
var matches = [ 
	{
		matchId: 'RWC20110119',
		kickoff: 1316503800000
	},
	{
		matchId: 'RWC20110120',
		kickoff: 1316503800000
	},
	{
		matchId: 'RWC20110121',
		kickoff: 1316583000000 
	},
	{
		matchId: 'RWC20110122',
		kickoff: 1316671200000 
	},
	{
		matchId: 'RWC20110123',
		kickoff: 1316759400000 
	}
]

var matches = matches.reverse();
logger.info(matches);

for ( var i = 0; i < matches.length; i++ ) {
	isEnded(matches[i]);
}

function isEnded(match) {
	logger.info('Checking if ' + match.matchId + ' is ended');
	var commentary = "";
	var options = {
		host: 'media.foxsports.com.au',
		port: 80,
		path: '/stats/rwc/Rugby_MatchCentre_' + match.matchId + '_Commentary.json'
	}
	http.get(options, function(res) {
		var rawJSON = '';
		res.on('data', function(chunk) {
			rawJSON += chunk;
		});
		res.on('end', function() {
			cleanJSON = rawJSON.slice(22,-2);
			commentary = JSON.parse(cleanJSON);
			if ( commentary.Commentary_Events ) {
				if ( commentary.Commentary_Events.Event[0].Event_Type === "Full Time" ) {
					logger.info("Match " + match.matchId + " has ended");
					return;
				} else {
					logger.info("Starting loop for match " + match.matchId);
					everyone.now.commentary = commentary;
					loop(match);
				}
			} else {
				logger.info("Starting loop for match " + match.matchId);
				everyone.now.commentary = commentary;
				loop(match);
			}
		});
	});
};

function loop(match) {
	var looper = setInterval(function(){
		var localNow = (new Date()).getTime();
		var date = new Date();
		var offset = date.getTimezoneOffset() * 60 * 1000;
		var now = localNow + offset;
		var start = match.kickoff - 1200000;
		var end = match.kickoff + 7200000
		//logger.info( "now: " + now + " start: " + start + " end: " + end );
		//logger.info(match.matchId);
		if ( now > start && now < end ) {
			if ( commentary.Commentary_Events ) {
				var prevLen = commentary.Commentary_Events.Event.length
			} else {
				var prevLen = 0
			}
			// Go and fetch JSON
			http.get(options, function(res) {
				var rawJSON = '';
				res.on('data', function(chunk) {
					rawJSON += chunk;
				});
				res.on('end', function() {
					cleanJSON = rawJSON.slice(22,-2);
					commentary = JSON.parse(cleanJSON);
					if ( commentary.Commentary_Events ) {
						var newLen = commentary.Commentary_Events.Event.length;
					} else {
						var newLen = 0;
					}
					//logger.info("prevLen: " + prevLen + " newLen: " + newLen);
					if ( newLen > prevLen ) {
						everyone.now.commentary = commentary;
						//logger.info(everyone.now.commentary);
						logger.info("Sending commentary for " + match.matchId);
						everyone.now.write();
					}
					if ( commentary.Commentary_Events ) {
						if ( commentary.Commentary_Events.Event[commentary.Commentary_Events.Event.length - 1].Event_Type === "Full Time" ) {
							logger.info("Match " + match.matchId + " has ended");
							clearTimeout(looper);
							return;
						}
					}
				});
			});
		};
	}, 1000);
};
