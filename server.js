var http = require('http');
var express = require('express');
var app = require('express').createServer();
app.use(express.static(__dirname + '/public', { maxAge: 14 * 24 * 60 * 60 * 1000 }));
app.listen(3000);

var nowjs = require("now");
var everyone = require("now").initialize(app);

everyone.now.logStuff = function(msg){
	console.log(msg);
}

var matches = [ 
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

for ( var i = 0; i < matches.length; i++ ) {
	loop(matches[i]);
}

function loop(match) {
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
			everyone.now.commentary = commentary;
		});
	});
	setInterval(function(){
		var now = (new Date()).getTime(); 
		var start = match.kickoff - 1200000;
		var end = match.kickoff + 7200000
		//console.log( "now: " + now + " start: " + start + " end: " + end );
		//console.log(match.matchId);
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
					//console.log("prevLen: " + prevLen + " newLen: " + newLen);
					if ( newLen > prevLen ) {
						everyone.now.commentary = commentary;
						//console.log(everyone.now.commentary);
						console.log("Sending commentary for " + match.matchId);
						everyone.now.write();
					}
				});
			});
		};
	}, 5000);
};
