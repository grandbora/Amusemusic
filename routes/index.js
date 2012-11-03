var fs = require('fs');

module.exports = function(app, foursquare, echonest) {
  
  fs.readdirSync(__dirname).forEach(function(file) {
    if (file == "index.js") {
      return;
    }
    var name = file.substr(0, file.indexOf('.'));
    require('./' + name)(app, foursquare, echonest);
  });
  
  app.get('*', function(req, res) {
    res.render('errors/404', {
      status: 404
    });
  });
}