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
    detectFaces(data.image, function (err, imageData) {
      if (!err) {
        io.sockets.emit('image_cv', {id: socket.id, image: imageData});
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

      for (var i=0; i<faces.length; i++){
         var x = faces[i]
         im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
      }

      var newImageData = im.toBuffer().toString('base64');
      callback(null, newImageData);
    });
  });
}
