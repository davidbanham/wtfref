now.ready(function(){
	if ( now.commentary ) {
		writeEvents();
	}
});
now.write = function(){
	writeEvents();
};

function writeEvents() {
	var existing = $('.comment').length;
	var events = 0;
	if ( now.commentary.Commentary_Events ) {
		events = now.commentary.Commentary_Events.Event.length;
	}
	if ( existing > events ) {
		existing.remove();
		console.log("Looks like we're switching to a new game feed.");
	};
	for ( var i = events - existing - 1; i > -1; i-- ) {
		var string = "<div class='row'>" + "<p class='span1'>" + now.commentary.Commentary_Events.Event[i].Details.Minute + "</p>" + "<p class='span15 comment'>" + now.commentary.Commentary_Events.Event[i].Comment + "</p>" + "</div>";
		$('body').prepend(string);
	};
	$('#homeName').text(now.commentary.HomeTeam);
	$('#awayName').text(now.commentary.AwayTeam);
	if ( now.commentary.Commentary_Events ) {
		$('#homeScore').text(now.commentary.Commentary_Events.Event[0].Details.Home_Score);
		$('#awayScore').text(now.commentary.Commentary_Events.Event[0].Details.Away_Score);
	};
};
