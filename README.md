# Pusher Experiment

Interactive demo for [Pusher](https://pusher.com/) real-time channels — covering public, private, and presence channel types.

## Features

- **Connection status** — live indicator with socket ID display
- **Channel subscription** — subscribe/unsubscribe to public, private, and presence channels with quick presets
- **Server-side event triggering** — send events through the Express server API
- **Client events** — send client events directly from subscribed private/presence channels
- **Presence members** — real-time member list for presence channels (join/leave)
- **Event log** — all incoming events displayed in a live, color-coded log
- **Auth endpoint info** — shows the auth URL and a curl example

## Setup

```bash
npm install
npm start
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## Configuration

Pusher credentials can be set via environment variables:

```bash
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster
PORT=5000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/` | Demo page |
| `POST` | `/pusher/auth` | Auth endpoint for private/presence channels |
| `POST` | `/trigger` | Trigger an event (body: `{ channel, event, data }`) |
| `GET`  | `/channels` | List active channels |
| `GET`  | `/channels/:name/users` | List users on a presence channel |

## Files

- **server.js** — Express server with Pusher auth, trigger, and channel query APIs
- **html-generator.js** — Generates the interactive demo page
- **client.html** — Standalone minimal client (original example)
- **index.js** — Standalone server-side trigger/query script (original example)
