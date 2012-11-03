module.exports = function(app, foursquare, echonest) {
  
  app.get('/', function(req, res) {
    res.render('index');
  });

  app.get('/login', function(req, res) {
	res.redirect(foursquare.getAuthClientRedirectUrl());
  });

  app.get('/login/callback', function(req, res) {
	foursquare.getAccessToken({
		code: req.query.code
	}, function (error, accessToken) {

		if(error) {
			return res.send("An error was thrown: " + error.message);
		}

		req.session.accessToken = accessToken;
		res.redirect('/checkin');

	});
  });


  app.get('/checkin', function(req, res) {

  	foursquare.Users.getCheckins('self', null, req.session.accessToken, function(error, result){

		var	rounder = 10;

		echonest.song.search({
			results : 5,
			min_longitude : Math.floor(result.checkins.items[1].venue.location.lng * rounder) / rounder,
			max_longitude : Math.ceil(result.checkins.items[1].venue.location.lng * rounder) / rounder,
			min_latitude : Math.floor(result.checkins.items[1].venue.location.lat * rounder) / rounder,
			max_latitude : Math.ceil(result.checkins.items[1].venue.location.lat * rounder) / rounder
		}, function(error, songResult){

			var tracks = [];
			var request = require('superagent');

			getTrackData(app.config.soundcloud.clientId, request, tracks, 0, songResult.songs, function(tracks){
				//console.log(tracks);

				for (var i = 0; i < songResult.songs.length; i++) {
					songResult.songs[i].trackData = tracks[i];
				};

console.log(result.checkins.items[1]);
//console.log(songResult.songs);

				res.render('checkins',{
					checkin : result.checkins.items[1],
					songs : songResult.songs
				});	
			});
 			
		});

  	});
  });
};


function getTrackData (clientId, request, tracks, index, songs, cb) {

  	request
		.get('http://api.soundcloud.com/tracks')
		.query({
			client_id : clientId,
			q : songs[index].title
		})
		.set('Accept', 'application/json')
		.end(function(trackResponse){

			tracks.push(trackResponse.res.body);
			if (index === songs.length - 1 ) {
				return cb(tracks);
			}

			index++;
			return getTrackData(clientId, request, tracks, index, songs, cb)
		});
}