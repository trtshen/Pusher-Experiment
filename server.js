var express = require('express');
var Pusher = require('pusher');
const htmlGenerator = require('./html-generator')

var bodyParser = require('body-parser');
var pusher = new Pusher({
  appId: '624422',
  key: 'bb4968be24f5bc816119',
  secret: 'be2f650d0626b5f5a35e',
  cluster: 'ap1',
  encrypted: true
});

var app = express();

// Allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/pusher/auth', function(req, res) {
  // var socketId = req.body.socket_id;
  // var channel = req.body.channel_name;
  var auth = pusher.authenticate(req.body.socket_id, req.body.channel_name);
  console.log(auth);
  res.send(auth);
});

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(htmlGenerator.generate('/pusher/auth'));
});

var port = process.env.PORT || 5000;
app.listen(port);