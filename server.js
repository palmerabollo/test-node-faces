var express = require('express'),
    http = require('http'),
    faces = require('faces');

var app = express();

app.configure(function () {
    app.use("/", express.static(__dirname + '/'));
});

var server = http.createServer(app).listen(2500);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  io.sockets.emit('news', { id: socket.id });
  
  socket.on('image', function processImage(data) {
    console.log(data.image);
    var binaryData = new Buffer(data.image, 'base64');

    var faceStream = faces.createStream();

    faceStream.write(binaryData);
    faceStream.on('data', function(frame) {
        io.sockets.emit('image_cv', {image: faces.toImageUrl(frame)});    
    })
  });
});

io.set('log level', 1);
