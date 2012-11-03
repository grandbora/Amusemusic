var util = require('util');
var express = require('express');

var app = module.exports = express();
var config = app.config = require('./config');
var foursquare = require("node-foursquare-2")(config.fsq);

var echonest = require('echonest');
echonest = new echonest.Echonest(config.echonest);

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
  secret: config.secret
}));
app.use(express.errorHandler({
  showStack: true,
  dumpExceptions: true
}));
app.use(express.logger({
  format: ':req[x-real-ip] :date (:response-time ms): :method :url'
}));

app.use(express.static(__dirname + '/public'));

require('./routes')(app, foursquare, echonest);
app.listen(80);