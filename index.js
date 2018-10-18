var Pusher = require('pusher');

var pusher = new Pusher({
  appId: '624422',
  key: 'bb4968be24f5bc816119',
  secret: 'be2f650d0626b5f5a35e',
  cluster: 'ap1',
  encrypted: true,
  authEndpoint: 'http://localhost:5000/pusher/auth'
});

pusher.trigger([
	'private-sandbox-team-1144-280-20',
	'private-sandbox-notification-786fc80896b25422b5324cb6e57b701c-280-20',
	'presence-sandbox-team-1144-280-20',
  'private-my-channel',
], 'send-event', {
  "message": "hello world"
});

pusher.get({ path: '/channels/private-sandbox-team-1144-280-20/users', params: {} },
  function(error, request, response) {
    if(response.statusCode === 200) {
      var result = JSON.parse(response.body);
      var users = result.users;
      console.log(users);
    }
  });

pusher.get({ path: '/apps/624422/events', params: {} },
  function(error, request, response) {
	if (response.statusCode === 200) {
	  var result = JSON.parse(response.body);
	  var users = result.users;
	  console.log(users);
	}
});

