
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('clientSendImage', function (data) {
    var image = data.replace(/^data:image\/png;base64,/,"");
    var d = new Date();
    var fileDir = __dirname + '/public/images/';
    var fileName = 'temp_'+d.getTime()+'.png';

    fs.open(fileDir+fileName, 'a', 0755, function(err, fd) {
        if (err) throw err;

        fs.writeFile(fileDir+fileName
          ,new Buffer(image,"base64")
          ,function(err) {
            fs.close(fd, function() {
                console.log('File saved successful!');
            });
        });

    });
  });

});

