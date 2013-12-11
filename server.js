var express = require('express'),
    http = require('http'),
    cv = require('opencv');

var app = express();

app.configure(function () {
    app.use("/", express.static(__dirname + '/'));
});

var pending = {};

var server = http.createServer(app).listen(2500);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  io.sockets.emit('news', { id: socket.id });
  
  socket.on('image', function processImage(data) {
    if (pending[socket.id]) {
      console.log("pending op");
      return;
    }

    pending[socket.id] = true;

    var binaryData = new Buffer(data.image, 'base64');
    
    cv.readImage(binaryData, function(err, im) {
      if (!err) {
        im.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
            for (var i=0; i<faces.length; i++){
               var x = faces[i]
               im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
            }
            var imageURL = im.toBuffer().toString('base64');
            io.sockets.emit('image_cv', {image: imageURL});    
        });
      }

      delete pending[socket.id];
    });
  });
});

io.set('log level', 1);

