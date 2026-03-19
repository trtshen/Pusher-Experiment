const generate = ({ authEndpoint, pusherKey, pusherCluster }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pusher Demo</title>
  <script src="https://js.pusher.com/7.2/pusher.min.js"><\/script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; color: #1a1a2e; padding: 20px; }
    h1 { text-align: center; margin-bottom: 6px; font-size: 1.8rem; }
    .subtitle { text-align: center; color: #666; margin-bottom: 24px; font-size: 0.95rem; }

    .status-bar {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 10px 20px; background: #fff; border-radius: 8px;
      margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .status-dot { width: 12px; height: 12px; border-radius: 50%; background: #999; transition: background 0.3s; }
    .status-dot.connected { background: #22c55e; }
    .status-dot.connecting { background: #f59e0b; }
    .status-dot.failed { background: #ef4444; }

    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 1200px; margin: 0 auto; }
    @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }

    .card {
      background: #fff; border-radius: 10px; padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .card h2 { font-size: 1.1rem; margin-bottom: 14px; color: #300d38; border-bottom: 2px solid #e9d5ff; padding-bottom: 8px; }

    label { display: block; font-size: 0.85rem; font-weight: 600; color: #555; margin-bottom: 4px; margin-top: 10px; }
    input, select, textarea {
      width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px;
      font-size: 0.9rem; font-family: inherit;
    }
    textarea { resize: vertical; min-height: 60px; font-family: 'Menlo', 'Consolas', monospace; font-size: 0.82rem; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,0.15); }

    button {
      padding: 8px 18px; border: none; border-radius: 6px; cursor: pointer;
      font-size: 0.9rem; font-weight: 600; transition: all 0.15s;
    }
    .btn-primary { background: #7c3aed; color: #fff; }
    .btn-primary:hover { background: #6d28d9; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover { background: #dc2626; }
    .btn-secondary { background: #e5e7eb; color: #374151; }
    .btn-secondary:hover { background: #d1d5db; }

    .btn-row { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }

    .event-log {
      max-height: 400px; overflow-y: auto; font-family: 'Menlo', 'Consolas', monospace;
      font-size: 0.78rem; background: #1e1e2e; color: #cdd6f4; border-radius: 8px;
      padding: 12px; line-height: 1.6;
    }
    .event-log:empty::before { content: 'Waiting for events...'; color: #666; }
    .log-time { color: #89b4fa; }
    .log-channel { color: #a6e3a1; }
    .log-event { color: #f9e2af; }
    .log-data { color: #cdd6f4; }
    .log-system { color: #9399b2; font-style: italic; }
    .log-error { color: #f38ba8; }
    .log-entry { border-bottom: 1px solid #313244; padding: 4px 0; }

    .channel-list { list-style: none; }
    .channel-list li {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; border-radius: 6px; margin-bottom: 4px; background: #f8f9fa;
      font-size: 0.85rem;
    }
    .channel-list li .ch-name { font-family: 'Menlo', 'Consolas', monospace; font-weight: 600; }
    .channel-badge {
      font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; font-weight: 600;
    }
    .badge-public { background: #dbeafe; color: #1d4ed8; }
    .badge-private { background: #fef3c7; color: #92400e; }
    .badge-presence { background: #d1fae5; color: #065f46; }

    .members-list { list-style: none; }
    .members-list li {
      padding: 6px 10px; margin-bottom: 3px; border-radius: 6px;
      background: #f0fdf4; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;
    }
    .member-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }

    .quick-presets { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .preset-btn {
      font-size: 0.75rem; padding: 4px 10px; background: #f3f4f6; border: 1px solid #d1d5db;
      border-radius: 14px; cursor: pointer; transition: all 0.15s;
    }
    .preset-btn:hover { background: #e9d5ff; border-color: #7c3aed; }

    .info-box {
      background: #f8f9fa; border-radius: 6px; padding: 12px; font-size: 0.82rem;
      font-family: 'Menlo', 'Consolas', monospace; color: #555; white-space: pre-wrap;
      word-break: break-all;
    }

    .full-width { grid-column: 1 / -1; }
  </style>
</head>
<body>
  <h1>Pusher Demo</h1>
  <p class="subtitle">Interactive demo for Pusher real-time channels &mdash; public, private &amp; presence</p>

  <!-- Connection Status -->
  <div class="status-bar">
    <div class="status-dot" id="statusDot"></div>
    <span id="statusText">Initializing...</span>
    <span style="margin-left:12px; font-size:0.8rem; color:#888;" id="socketIdDisplay"></span>
  </div>

  <div class="grid">
    <!-- Subscribe to Channel -->
    <div class="card">
      <h2>Subscribe to Channel</h2>
      <p style="font-size:0.83rem; color:#666; margin-bottom:8px;">Quick presets:</p>
      <div class="quick-presets">
        <button class="preset-btn" onclick="applyPreset('my-channel', 'public')">public: my-channel</button>
        <button class="preset-btn" onclick="applyPreset('private-my-channel', 'private')">private: private-my-channel</button>
        <button class="preset-btn" onclick="applyPreset('presence-demo', 'presence')">presence: presence-demo</button>
      </div>
      <label for="channelType">Channel Type</label>
      <select id="channelType" onchange="updateChannelPrefix()">
        <option value="public">Public</option>
        <option value="private">Private</option>
        <option value="presence">Presence</option>
      </select>
      <label for="channelName">Channel Name</label>
      <input type="text" id="channelName" placeholder="my-channel" value="my-channel">
      <label for="eventBind">Bind to Event (optional)</label>
      <input type="text" id="eventBind" placeholder="my-event">
      <div class="btn-row">
        <button class="btn-primary" onclick="subscribeChannel()">Subscribe</button>
      </div>
    </div>

    <!-- Active Subscriptions -->
    <div class="card">
      <h2>Active Subscriptions</h2>
      <ul class="channel-list" id="channelList">
      </ul>
      <p id="noChannels" style="color:#999; font-size:0.85rem;">No channels subscribed yet.</p>
    </div>

    <!-- Trigger Event -->
    <div class="card">
      <h2>Trigger Event</h2>
      <p style="font-size:0.83rem; color:#666; margin-bottom:8px;">Send events via the server or as client events.</p>
      <label for="triggerChannel">Channel</label>
      <input type="text" id="triggerChannel" placeholder="my-channel" value="my-channel">
      <label for="triggerEvent">Event Name</label>
      <input type="text" id="triggerEvent" placeholder="my-event" value="my-event">
      <label for="triggerData">Event Data (JSON)</label>
      <textarea id="triggerData">{ "message": "hello world" }</textarea>
      <div class="btn-row">
        <button class="btn-primary" onclick="triggerServerEvent()">Trigger via Server</button>
        <button class="btn-secondary" onclick="triggerClientEvent()">Send Client Event</button>
      </div>
    </div>

    <!-- Presence Members -->
    <div class="card">
      <h2>Presence Channel Members</h2>
      <p style="font-size:0.83rem; color:#666; margin-bottom:8px;">Members of subscribed presence channels appear here.</p>
      <ul class="members-list" id="membersList">
      </ul>
      <p id="noMembers" style="color:#999; font-size:0.85rem;">No presence channel subscribed.</p>
    </div>

    <!-- Event Log -->
    <div class="card full-width">
      <h2>
        Event Log
        <button class="btn-danger" style="float:right; font-size:0.75rem; padding:4px 12px;" onclick="clearLog()">Clear</button>
      </h2>
      <div class="event-log" id="eventLog"></div>
    </div>

    <!-- Auth Endpoint Info -->
    <div class="card full-width">
      <h2>Auth Endpoint Info</h2>
      <p style="font-size:0.85rem; color:#555; margin-bottom:10px;">
        The Pusher auth endpoint for private/presence channels:
      </p>
      <div class="info-box" id="authInfo">Loading...</div>
      <p style="font-size:0.83rem; color:#666; margin-top:10px;">Test with curl:</p>
      <div class="info-box" id="curlExample">Loading...</div>
    </div>
  </div>

  <script>
    // ── Pusher Setup ──
    Pusher.logToConsole = false;

    var pusher = new Pusher('${pusherKey}', {
      cluster: '${pusherCluster}',
      forceTLS: true,
      authEndpoint: window.location.origin + '${authEndpoint}'
    });

    var subscriptions = {};   // channelName -> { channel, type, events[] }
    var presenceMembers = {}; // channelName -> { id: info }

    // ── Connection Status ──
    var statusDot = document.getElementById('statusDot');
    var statusText = document.getElementById('statusText');
    var socketIdDisplay = document.getElementById('socketIdDisplay');

    pusher.connection.bind('state_change', function(states) {
      updateConnectionStatus(states.current);
    });
    pusher.connection.bind('connected', function() {
      socketIdDisplay.textContent = 'Socket ID: ' + pusher.connection.socket_id;
    });
    updateConnectionStatus(pusher.connection.state);

    function updateConnectionStatus(state) {
      statusDot.className = 'status-dot';
      if (state === 'connected') { statusDot.classList.add('connected'); }
      else if (state === 'connecting' || state === 'reconnecting') { statusDot.classList.add('connecting'); }
      else if (state === 'failed' || state === 'disconnected') { statusDot.classList.add('failed'); }
      statusText.textContent = state.charAt(0).toUpperCase() + state.slice(1);
      logSystem('Connection state: ' + state);
    }

    // ── Auth Info ──
    var origin = window.location.origin;
    document.getElementById('authInfo').textContent = origin + '${authEndpoint}';
    document.getElementById('curlExample').textContent =
      'curl -X POST ' + origin + '${authEndpoint} \\\\\n' +
      '  -H "Content-Type: application/json" \\\\\n' +
      '  -d \'{"socket_id": "100.100", "channel_name": "private-document"}\'';

    // ── Channel Subscription ──
    function applyPreset(name, type) {
      document.getElementById('channelName').value = name;
      document.getElementById('channelType').value = type;
    }

    function updateChannelPrefix() {
      var type = document.getElementById('channelType').value;
      var nameInput = document.getElementById('channelName');
      var val = nameInput.value.replace(/^(private-|presence-)/, '');
      if (type === 'private') nameInput.value = 'private-' + val;
      else if (type === 'presence') nameInput.value = 'presence-' + val;
      else nameInput.value = val;
    }

    function subscribeChannel() {
      var name = document.getElementById('channelName').value.trim();
      var type = document.getElementById('channelType').value;
      var eventName = document.getElementById('eventBind').value.trim();

      if (!name) return;
      if (subscriptions[name]) {
        logSystem('Already subscribed to ' + name);
        if (eventName && !subscriptions[name].events.includes(eventName)) {
          bindEvent(name, eventName);
        }
        return;
      }

      var channel = pusher.subscribe(name);
      subscriptions[name] = { channel: channel, type: type, events: [] };

      channel.bind('pusher:subscription_succeeded', function(members) {
        logSystem('Subscribed to ' + name);
        if (type === 'presence' && members) {
          presenceMembers[name] = {};
          members.each(function(member) {
            presenceMembers[name][member.id] = member.info;
          });
          renderMembers();
        }
        renderChannelList();
      });

      channel.bind('pusher:subscription_error', function(err) {
        logError('Subscription error for ' + name + ': ' + JSON.stringify(err));
      });

      // Presence channel events
      if (type === 'presence') {
        channel.bind('pusher:member_added', function(member) {
          if (!presenceMembers[name]) presenceMembers[name] = {};
          presenceMembers[name][member.id] = member.info;
          logSystem('Member added to ' + name + ': ' + member.id);
          renderMembers();
        });
        channel.bind('pusher:member_removed', function(member) {
          if (presenceMembers[name]) delete presenceMembers[name][member.id];
          logSystem('Member removed from ' + name + ': ' + member.id);
          renderMembers();
        });
      }

      // Bind to all events for logging
      channel.bind_global(function(eventName, data) {
        if (eventName.startsWith('pusher:') || eventName.startsWith('pusher_internal:')) return;
        logEvent(name, eventName, data);
      });

      // Bind specific event if provided
      if (eventName) { bindEvent(name, eventName); }

      renderChannelList();
    }

    function bindEvent(channelName, eventName) {
      if (!subscriptions[channelName]) return;
      subscriptions[channelName].events.push(eventName);
      logSystem('Bound event "' + eventName + '" on ' + channelName);
    }

    function unsubscribeChannel(name) {
      pusher.unsubscribe(name);
      delete subscriptions[name];
      delete presenceMembers[name];
      logSystem('Unsubscribed from ' + name);
      renderChannelList();
      renderMembers();
    }

    // ── Trigger Events ──
    function triggerServerEvent() {
      var channel = document.getElementById('triggerChannel').value.trim();
      var event = document.getElementById('triggerEvent').value.trim();
      var dataStr = document.getElementById('triggerData').value.trim();
      if (!channel || !event) return;

      var data;
      try { data = JSON.parse(dataStr); } catch(e) { logError('Invalid JSON: ' + e.message); return; }

      fetch(origin + '/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: channel, event: event, data: data })
      })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) logSystem('Server triggered "' + event + '" on ' + channel);
        else logError('Trigger failed: ' + (res.error || 'unknown'));
      })
      .catch(function(err) { logError('Trigger request failed: ' + err.message); });
    }

    function triggerClientEvent() {
      var channelName = document.getElementById('triggerChannel').value.trim();
      var event = document.getElementById('triggerEvent').value.trim();
      var dataStr = document.getElementById('triggerData').value.trim();
      if (!channelName || !event) return;

      if (!subscriptions[channelName]) {
        logError('Must be subscribed to ' + channelName + ' to send client events');
        return;
      }
      if (!channelName.startsWith('private-') && !channelName.startsWith('presence-')) {
        logError('Client events only work on private or presence channels');
        return;
      }
      if (!event.startsWith('client-')) {
        event = 'client-' + event;
      }

      var data;
      try { data = JSON.parse(dataStr); } catch(e) { logError('Invalid JSON: ' + e.message); return; }

      var ok = subscriptions[channelName].channel.trigger(event, data);
      if (ok) logSystem('Client event "' + event + '" sent on ' + channelName);
      else logError('Failed to send client event (channel may not be subscribed)');
    }

    // ── Rendering ──
    function renderChannelList() {
      var list = document.getElementById('channelList');
      var noMsg = document.getElementById('noChannels');
      var names = Object.keys(subscriptions);
      noMsg.style.display = names.length ? 'none' : 'block';

      list.innerHTML = names.map(function(name) {
        var type = subscriptions[name].type;
        var badgeClass = 'badge-' + type;
        return '<li>' +
          '<span><span class="ch-name">' + escapeHtml(name) + '</span> ' +
          '<span class="channel-badge ' + badgeClass + '">' + type + '</span></span>' +
          '<button class="btn-danger" style="font-size:0.75rem;padding:3px 10px;" ' +
          'onclick="unsubscribeChannel(\\''+name+'\\')">Unsub</button>' +
          '</li>';
      }).join('');
    }

    function renderMembers() {
      var list = document.getElementById('membersList');
      var noMsg = document.getElementById('noMembers');
      var allMembers = [];

      Object.keys(presenceMembers).forEach(function(ch) {
        Object.keys(presenceMembers[ch]).forEach(function(id) {
          allMembers.push({ channel: ch, id: id, info: presenceMembers[ch][id] });
        });
      });

      noMsg.style.display = allMembers.length ? 'none' : 'block';
      list.innerHTML = allMembers.map(function(m) {
        var infoStr = m.info && m.info.name ? m.info.name : m.id;
        return '<li><span class="member-dot"></span>' +
          '<span>' + escapeHtml(infoStr) + '</span>' +
          '<span style="font-size:0.75rem;color:#888;margin-left:auto;">' + escapeHtml(m.channel) + '</span>' +
          '</li>';
      }).join('');
    }

    // ── Event Log ──
    var logEl = document.getElementById('eventLog');

    function logEvent(channel, event, data) {
      var entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.innerHTML =
        '<span class="log-time">' + timestamp() + '</span> ' +
        '<span class="log-channel">[' + escapeHtml(channel) + ']</span> ' +
        '<span class="log-event">' + escapeHtml(event) + '</span> ' +
        '<span class="log-data">' + escapeHtml(JSON.stringify(data)) + '</span>';
      logEl.appendChild(entry);
      logEl.scrollTop = logEl.scrollHeight;
    }

    function logSystem(msg) {
      var entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.innerHTML = '<span class="log-time">' + timestamp() + '</span> <span class="log-system">' + escapeHtml(msg) + '</span>';
      logEl.appendChild(entry);
      logEl.scrollTop = logEl.scrollHeight;
    }

    function logError(msg) {
      var entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.innerHTML = '<span class="log-time">' + timestamp() + '</span> <span class="log-error">ERROR: ' + escapeHtml(msg) + '</span>';
      logEl.appendChild(entry);
      logEl.scrollTop = logEl.scrollHeight;
    }

    function clearLog() { logEl.innerHTML = ''; }

    function timestamp() {
      var d = new Date();
      return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
    }

    function escapeHtml(str) {
      if (typeof str !== 'string') str = String(str);
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }
  <\/script>
</body>
</html>`;
};

exports.generate = generate;
