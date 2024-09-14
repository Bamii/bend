var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocket = require('ws');
var WebSocketJSONStream = require('@teamwork/websocket-json-stream');
var json1 = require('ot-json1');

ShareDB.types.register(json1.type);

var backend = new ShareDB();
createDoc(startServer);

// Create initial document then fire callback
function createDoc(callback) {
  var connection = backend.connect();
  var doc = connection.get('nothing', 'files');
  doc.fetch(function(err) {
    if (err) throw err;
    if (doc.type === null) {
      console.log("doc is null")
      doc.create({numClicks: 0}, callback);
      return;
    }
    callback();
  });
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  var app = express();
  app.use(express.static('static'));
  var server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({ server: server});
  wss.on('connection', function(ws) {
    console.log('nex')
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });

  // backend.on("send", function(send) {
  //   console.log("send")
  //   // const [,...data] = arguments;
  //   // console.log(data)
  // })

  backend.use("receive", (context, next) => {
    console.log(context.data)
    next()
  })

  server.listen(4445);
  console.log('Listening on http://localhost:8080');
}
