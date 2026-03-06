# Brutal Talks

Connect with random strangers around the world — no accounts, no data, no trace. Just talk.

## What It Is

Brutal Talks is an Omegle-style random video/audio chat app. Open it, get matched with a stranger, talk, disconnect. Nothing is stored, nothing is tracked.

## Tech Stack

- **Frontend** – React + TypeScript, Vite
- **Backend** – Node.js + Express (signaling only)
- **Real-time** – WebRTC (peer-to-peer), WebSockets (signaling)
- **Build** – Custom build script (`script/build.ts`)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

App runs at `http://localhost:5000`.

### Build for production

```bash
npm run build
node dist/server/index.js
```

## Project Structure

```
Brutaltalks/
├── client/          # React frontend
├── server/          # Express backend + signaling server
├── shared/          # Shared types and utilities
├── script/          # Build scripts
└── public/          # Favicon
```

## How It Works

1. User opens the app and joins the matchmaking pool
2. Server pairs two random users together via WebSockets
3. WebRTC negotiation happens (offer/answer/ICE candidates exchanged)
4. Once connected, audio/video streams go directly peer-to-peer
5. Server is out of the media path — zero data stored, zero logs

## Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
```

## Privacy

No database. No accounts. No message history. No personal data collected. When you disconnect, it's gone.