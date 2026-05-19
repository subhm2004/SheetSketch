<div align="center">

# ✦ SheetSketch

**Collaborative whiteboard with a hand-drawn feel — sketch, sync, and ship ideas together in real time.**

[Get Started](#-quick-start) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Environment](#-environment-variables) · [Deploy](#-deployment)

<br />

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Liveblocks](https://img.shields.io/badge/Liveblocks-Realtime-6957FF?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

<br />

```
┌─────────────────────────────────────────────────────────────────┐
│  Landing  →  Create / Join Room  →  Draw + Chat + Invite  →  ✓  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📖 Overview

**SheetSketch** is a full-stack collaborative drawing app inspired by Excalidraw. Create password-protected rooms, invite teammates with a link, draw on an infinite canvas with Rough.js hand-drawn shapes, see live cursors, chat in real time, and optionally generate diagrams from natural language using AI.

Built for teams who want a lightweight whiteboard without heavy setup — just a room ID, a password, and a browser.

---

## ✨ Features

### 🎨 Drawing & canvas

| Feature | Description |
|--------|-------------|
| **Hand-drawn style** | Rectangles, ellipses, lines, arrows, freehand, and text via [Rough.js](https://roughjs.com/) |
| **Infinite canvas** | Pan, zoom, and reset view — work without running out of space |
| **Properties panel** | Stroke, fill, roughness, opacity, and per-shape editing |
| **Eraser & select** | Move, resize, and delete shapes with the selection tool |
| **Undo / redo** | Collaborative history powered by Liveblocks |

### 👥 Real-time collaboration

| Feature | Description |
|--------|-------------|
| **Live cursors** | See where everyone is pointing — toggle others’ cursors on/off |
| **Presence** | Avatars and online count in the room header |
| **Synced storage** | Shapes and chat messages sync instantly across clients |
| **Room chat** | Side panel with unread indicator when chat is closed |

### 🔐 Rooms & access

| Feature | Description |
|--------|-------------|
| **Create room** | Pick a room ID + password; stored securely in Upstash Redis |
| **Join room** | Enter credentials to get a JWT session (24h) |
| **Invite links** | Share a 7-day invite URL — guests join with name only (no password) |
| **Guest identity** | Stable per-browser guest ID for chat and presence |

### 🤖 AI draw (optional)

| Feature | Description |
|--------|-------------|
| **Prompt → shapes** | Describe a diagram; AI places shapes on the visible canvas |
| **OpenAI** | Primary provider via `OPEN_AI_API_KEY` |
| **Groq fallback** | Free-tier fallback when OpenAI quota is exhausted |

### 🌗 UI & experience

| Feature | Description |
|--------|-------------|
| **Landing page** | Hero, features, testimonials, FAQ, and CTA |
| **Theme toggle** | Light · System · Dark (pill control) |
| **Responsive layout** | Toolbar, properties panel, and mobile-friendly header |

---

## 🏗 Tech stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI** | React 19, Tailwind CSS 4, Framer Motion |
| **Drawing** | Rough.js, HTML Canvas |
| **Realtime** | [Liveblocks](https://liveblocks.io/) (presence, storage, broadcast) |
| **Database** | [Upstash Redis](https://upstash.com/) (rooms, invite tokens) |
| **Auth** | JWT + bcrypt (room passwords) |
| **AI** | OpenAI API (+ optional Groq) |

---

## 🔄 How it works

```mermaid
flowchart LR
  subgraph Client
    A[Landing / Get Started]
    B[Room Canvas]
  end

  subgraph API
    C[/api/rooms]
    D[/api/liveblocks-auth]
    E[/api/invite]
    F[/api/ai-draw]
  end

  subgraph Services
    G[(Upstash Redis)]
    H[Liveblocks Cloud]
    I[OpenAI / Groq]
  end

  A --> C
  C --> G
  B --> D
  D --> H
  B --> H
  B --> F
  F --> I
  E --> G
```

1. **Create or join** a room → API validates password → returns JWT in `sessionStorage`.
2. **Liveblocks auth** exchanges JWT for a session scoped to that room.
3. **Draw & chat** mutate Liveblocks storage; all clients receive updates in real time.
4. **Invite link** lets guests skip the password and join with a display name only.

---

## 🚀 Quick start

### Prerequisites

- **Node.js 18+** (20+ recommended)
- Free accounts: [Liveblocks](https://liveblocks.io), [Upstash](https://upstash.com)
- Optional: [OpenAI](https://platform.openai.com/) or [Groq](https://console.groq.com/) for AI draw

### 1. Clone & install

```bash
git clone <your-repo-url>
cd excalidraw-clone-main   # or your folder name
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `LIVEBLOCKS_SECRET_KEY` | ✅ | Liveblocks secret key (`sk_live_...`) |
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash Redis REST token |
| `JWT_SECRET` | ✅ | Long random string (`openssl rand -base64 32`) |
| `OPEN_AI_API_KEY` | ⬜ | OpenAI API key for AI draw |
| `GROQ_API_KEY` | ⬜ | Groq key (fallback when OpenAI has no quota) |

> **Note:** ChatGPT Plus ≠ OpenAI API billing. API usage needs credits at [platform.openai.com/settings/billing](https://platform.openai.com/settings/billing).

### 3. Run locally

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

### 4. Try it

1. Go to **Get Started** → create a room (e.g. `my-team`, password `secret123`).
2. Open the room in another browser or incognito → join with the same credentials.
3. Draw, move cursors, open **Chat**, and use **Invite** to copy a guest link.

---

## 📁 Project structure

```
├── app/
│   ├── page.tsx                 # Landing page
│   ├── get-started/             # Create / join room
│   ├── room/[roomId]/           # Main whiteboard
│   ├── invite/[token]/          # Guest invite flow
│   └── api/
│       ├── rooms/               # Create & join rooms
│       ├── liveblocks-auth/     # Liveblocks session
│       ├── invite/              # Invite tokens
│       └── ai-draw/             # AI shape generation
├── components/
│   ├── Canvas.tsx               # Room shell (header, toolbar, panels)
│   ├── CanvasCore.tsx           # Drawing engine
│   ├── RoomChat.tsx             # Real-time chat
│   ├── RoomAI.tsx               # AI draw panel
│   ├── LiveCursors.tsx          # Multiplayer cursors
│   └── landing/                 # Marketing sections
├── lib/
│   ├── liveblocks.ts            # Liveblocks client & types
│   ├── types.ts                 # Shapes, tools, presence
│   ├── ai-shapes.ts             # AI prompt & parsing
│   └── guest-id.ts              # Browser guest ID
└── hooks/                       # Cursor presence, chat unread, etc.
```

---

## 🛠 Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run production server |

---

## 🌐 Deployment

Works on [Vercel](https://vercel.com), Railway, or any Node host that supports Next.js 16.

1. Push your repo to GitHub.
2. Import the project on Vercel.
3. Add all **required** environment variables from `.env.example`.
4. Deploy.

Ensure Liveblocks and Upstash allow requests from your production domain if you use restrictions.

---

## 🔒 Security notes

- Never commit `.env` — it is gitignored.
- Room passwords are **bcrypt-hashed** in Redis; JWTs expire after 24 hours.
- Invite tokens are time-limited (7 days).
- Liveblocks auth verifies JWT `roomId` matches the requested room.

---

## 🗺 Roadmap ideas

- [ ] Export canvas to PNG / JSON
- [ ] Room persistence history & snapshots
- [ ] Keyboard shortcuts cheat sheet
- [ ] Mobile touch drawing improvements
- [ ] OAuth / team workspaces

---

## 📄 License

This project is for **learning and portfolio use**. Excalidraw is a separate product; SheetSketch is an independent implementation inspired by the whiteboard category.

---

<div align="center">

**Built with ✦ by developers who sketch in meetings instead of paying attention**

[⬆ Back to top](#-sheetsketch)

</div>
