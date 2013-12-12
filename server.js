var express = require('express'),
    http = require('http'),
    cv = require('opencv');

var app = express();

app.configure(function () {
    app.use("/", express.static(__dirname + '/'));
});

var server = http.createServer(app).listen(2500);
var io = require('socket.io').listen(server);

io.set('log level', 1);

io.sockets.on('connection', function (socket) {
  socket.on('image', function processImage(data) {
    detectFaces(data.image, function (err, faces) {
      if (!err) {
        io.sockets.emit('faces', {id: socket.id, faces: faces});
      }
    });
  });
});

var detectFaces = function (imageData, callback) {
  var binaryData = new Buffer(imageData, 'base64');
  
  cv.readImage(binaryData, function(err, im) {
    if (err) {
      return callback(err);
    }

    im.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
      if (err) {
        return callback(err);
      }

      callback(null, faces);
    });
  });
}
