# LivePH

Frontend demo of a live-streaming social app (BIGO-style). Go live with camera/mic, chat, gift, invite guests, run timed PK battles, recharge coins, and withdraw.

> Frontend only for now — data is stored in the browser (`localStorage`). No backend yet.

## Features

- **Auth** — Login / register / verify (demo code). Session saved locally.
- **News feed** — Stories and posts that open live rooms.
- **Live** — Browse streams, filter by category or **PK Live**, go live with camera & mic.
- **Live room** — Chat, gifts, host profile photo when camera is off, speaking indicator.
- **Multi-guest** — Request to join (max **10** guests). Host can Accept / Reject. Joins are **locked during PK**.
- **PK battles** — Host starts PK, sets duration (5m–1h). Gifts add points; higher score wins. WIN/LOSE shown on profiles.
- **Gifts** — Send gifts in live; received gifts show on profiles (including “You sent”).
- **Recharge** — Coin packs + custom amount. Select a pack, then tap **Recharge**.
- **Withdraw** — Convert coins to PHP (min **1,000** coins, **5%** fee).
- **Profile** — Avatar, album, followers/following, PK W/L, gifts received.
- **Chat** — Private DMs from live names / profiles.
- **Settings** — Privacy, account, block list, logout / delete account.

## Requirements

- [Node.js](https://nodejs.org/) (LTS recommended)
- A modern browser (Chrome / Edge / Firefox)
- Camera & mic permission for **Go Live** (works on `localhost`)

## Setup

```bash
git clone https://github.com/JohnPaulManila/LivePH.git
cd LivePH
npm install
npm start
```

The app opens at **http://127.0.0.1:5500**.

## Demo login

| Field    | Value              |
|----------|--------------------|
| Email    | `dev@liveph.test`  |
| Password | `dev1234`          |
| Username | `dev`              |

Or use **Enter as DEV** on the login screen.

Register flow uses demo verify code: **`482915`**.

## Scripts

| Command       | Description                          |
|---------------|--------------------------------------|
| `npm start`   | Run with live-server on port 5500    |
| `npm run dev` | Same as `npm start`                  |

## Project structure

```
LivePH/
├── index.html          # App shell + panels
├── css/styles.css      # Styles
├── js/
│   ├── app.js          # Boot, navigation, auth gate
│   ├── auth.js         # Login / register / verify
│   ├── core.js         # State, storage, shared helpers
│   ├── data.js         # Demo streams, gifts, packs
│   ├── home.js         # News feed
│   ├── live.js         # Live grid + live room
│   ├── guests.js       # Join requests, PK, withdraw
│   ├── chat.js         # DMs / inbox
│   ├── profile.js      # Profiles & album
│   ├── recharge.js     # Coin packs
│   └── settings.js     # Settings
├── package.json
└── .gitignore
```

## Notes

- **`node_modules` is not in Git** — run `npm install` after cloning.
- Unauthenticated users only see the login/register screen.
- Camera/mic needs a secure context (`localhost` or HTTPS).
- Coins, VIP, gifts, PK stats, and album are stored in `localStorage` for the demo.

## License

ISC
