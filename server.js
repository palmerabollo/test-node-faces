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
    var binaryData = new Buffer(data.image, 'base64');
    
    var cv = require('opencv');
    cv.readImage(binaryData, function(err, im) {
        im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
            console.log("faces found: %d", faces.length);
            for (var i=0;i<faces.length; i++){
               var x = faces[i]
               im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
            }
            // "data:image/#{fmt};base64,#{buf.toString('base64')}"
            var imageURL = "data:image/jpg;base64," + im.toBuffer().toString('base64');
            io.sockets.emit('image_cv', {image: imageURL});    
        });    
    });
  });
});

io.set('log level', 0);
