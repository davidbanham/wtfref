now.ready(function(){
	if ( now.commentary ) {
		writeEvents();
	}
});
now.write = function(){
	writeEvents();
};

var writeEvents = function() {
	var existing = $('.comment').length;
	var events = 0;
	if ( now.commentary.Commentary_Events.Event ) {
		events = now.commentary.Commentary_Events.Event.length;
	}
	for ( var i = events - existing - 1; i > -1; i-- ) {
		var string = "<div class='row'>" + "<p class='span1'>" + now.commentary.Commentary_Events.Event[i].Details.Minute + "</p>" + "<p class='span15 comment'>" + now.commentary.Commentary_Events.Event[i].Comment + "</p>" + "</div>";
		$('body').prepend(string);
	};
};
