var express = require('express');
var Pusher = require('pusher');
const htmlGenerator = require('./html-generator');

var bodyParser = require('body-parser');

var PUSHER_APP_ID = process.env.PUSHER_APP_ID || '624422';
var PUSHER_KEY = process.env.PUSHER_KEY || 'bb4968be24f5bc816119';
var PUSHER_SECRET = process.env.PUSHER_SECRET || 'be2f650d0626b5f5a35e';
var PUSHER_CLUSTER = process.env.PUSHER_CLUSTER || 'ap1';

var pusher = new Pusher({
  appId: PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  useTLS: true
});

var app = express();

// Allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Pusher auth endpoint for private/presence channels
app.post('/pusher/auth', function(req, res) {
  var socketId = req.body.socket_id;
  var channelName = req.body.channel_name;

  // For presence channels, include user info
  if (channelName && channelName.startsWith('presence-')) {
    var userId = 'user-' + Math.random().toString(36).substring(2, 8);
    var presenceData = {
      user_id: userId,
      user_info: { name: 'Demo User ' + userId.slice(-4) }
    };
    var auth = pusher.authenticate(socketId, channelName, presenceData);
    console.log('Presence auth:', auth);
    return res.send(auth);
  }

  var auth = pusher.authenticate(socketId, channelName);
  console.log('Auth:', auth);
  res.send(auth);
});

// Trigger an event on a channel (called from the demo UI)
app.post('/trigger', function(req, res) {
  var channel = req.body.channel;
  var event = req.body.event;
  var data = req.body.data;

  if (!channel || !event) {
    return res.status(400).json({ error: 'channel and event are required' });
  }

  pusher.trigger(channel, event, data || {})
    .then(function() {
      res.json({ success: true, channel: channel, event: event });
    })
    .catch(function(err) {
      console.error('Trigger error:', err);
      res.status(500).json({ error: err.message });
    });
});

// Query channels info
app.get('/channels', function(req, res) {
  pusher.get({
    path: '/channels',
    params: { info: 'user_count', filter_by_prefix: req.query.prefix || '' }
  }, function(error, request, response) {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (response.statusCode === 200) {
      res.json(JSON.parse(response.body));
    } else {
      res.status(response.statusCode).json({ error: 'Failed to fetch channels' });
    }
  });
});

// Query users on a presence channel
app.get('/channels/:channelName/users', function(req, res) {
  pusher.get({
    path: '/channels/' + encodeURIComponent(req.params.channelName) + '/users',
    params: {}
  }, function(error, request, response) {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (response.statusCode === 200) {
      res.json(JSON.parse(response.body));
    } else {
      res.status(response.statusCode).json({ error: 'Failed to fetch users' });
    }
  });
});

// Serve the demo page
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(htmlGenerator.generate({
    authEndpoint: '/pusher/auth',
    pusherKey: PUSHER_KEY,
    pusherCluster: PUSHER_CLUSTER
  }));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log('Pusher demo server running on http://localhost:' + port);
});