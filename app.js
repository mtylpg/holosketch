
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var mobile = require('./routes/mobile');
var desktop = require('./routes/desktop');
var projector = require('./routes/projector');
var http = require('http');
var path = require('path');
var fs = require('fs');

var Firebase = require('firebase');
var myRootRef = new Firebase('https://actual-holodeck.firebaseio.com/');


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


//routing
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/mobile', function(req, res){

  //routing

  //1. enter holodeck launch screen - optional
  //can we combine this with the naming screen?

  //2. enter name, drop cookie - optional

  //3. is there a holodeck running? if not, give us a name for one
  if(app.get('currentSession')){
    //get info on the holodeck?
    mobile.view(req, res);
  } else {
    mobile.create(req, res);
  }
});

app.get('/loadSession', function(req, res){
  myRootRef.on('value', function(snapshot){
    sessions = snapshot.val().sessions;
    mobile.loadSession(req, res, {sessions: sessions});
  });
});

app.post('/start', function (req, res){

  if (req.body.name){

    //create session and save 
    var sessionName = req.body.name;
    var startTime = new Date().toString();

    //TODO: we probably want to check to see if the name already exists
    var sessionsRef = new Firebase('https://actual-holodeck.firebaseio.com/sessions');
    sessionsRef.child(sessionName).set({name: sessionName, startTime: startTime});

    app.set('currentSession', sessionName);

    //reroute
    mobile.view(req, res);

  } else {

    //no param, go back to create
    mobile.create(req, res);

  }

});

app.get('/endSession', function(req, res){

  //fetch session, set end time, and close out
  var sessionName = app.get('currentSession');
  var endTime = new Date().toString();

  var sessionsRef = new Firebase('https://actual-holodeck.firebaseio.com/sessions/' + sessionName);
  sessionsRef.child('endTime').set(endTime);

  app.set('currentSession', null);

  //reroute
  mobile.create(req, res);

});

app.get('/pastSession/:name', function(req, res){

  var sessionsRef = new Firebase('https://actual-holodeck.firebaseio.com/sessions/' + req.params.name);
  sessionsRef.on('value', function(snapshot){
    session = snapshot.val();
    console.log(session);
    desktop.pastSession(req, res, {session: session});
  });

  //console.log(req.params.name);

});

app.get('/projector', function (req, res){

  projector.view(req, res);

});
