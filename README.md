# HackMatch AI v2 🚀

**Production-grade AI-powered hackathon team formation platform.**

---

## Quick Start (3 commands)

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure environment
npm run setup
# → Edit backend/.env (add MONGODB_URI and JWT_SECRET)

# 3. Start everything
npm run dev
# → API:  http://localhost:5000
# → App:  http://localhost:3000
```

**Requires:** Node.js 18+, MongoDB (local or Atlas)

---

## New in v2

| Feature | Description |
|---|---|
| **AI Team Matching** | `/api/match` — multi-dimensional scoring (skill complementarity, experience balance, diversity, interest alignment) |
| **Leader Selection AI** | Automatically picks team leader by experience + project count + skill diversity |
| **Explainable AI** | Every team comes with a natural language "why this team works" explanation |
| **Real-Time WebSockets** | Socket.io — live notifications when a match is found |
| **AI Chat Assistant** | Context-aware coach using OpenAI GPT (falls back to rule-based) |
| **Resume Parsing** | PDF upload → automatic skill + experience extraction |
| **Notification System** | Persistent DB notifications + real-time toast delivery |
| **Team Rebalancing** | `/api/match/rebalance` — suggests improvements if team changes |

---

## Architecture

```
hackmatch/
├── backend/
│   ├── models/
│   │   └── User.js               ← Extended: notifications, teamHistory, skillVector
│   ├── routes/
│   │   ├── auth.js               ← Register, login, logout, /me
│   │   ├── profile.js            ← CRUD + avatar + resume parse + skill vector
│   │   ├── user.js               ← Discovery + suggested
│   │   ├── match.js              ← /match, /rebalance, /accept, /reject
│   │   ├── chat.js               ← AI assistant endpoint
│   │   └── notifications.js      ← Read, clear notifications
│   ├── services/
│   │   ├── matchingEngine.js     ← Core AI: scoring, team gen, leader selection
│   │   ├── resumeParser.js       ← PDF text extraction + skill identification
│   │   ├── chatService.js        ← OpenAI + rule-based fallback
│   │   └── socketManager.js      ← Socket.io real-time manager
│   └── server.js                 ← HTTP + WebSocket server
│
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.js    ← JWT auth state
        │   └── SocketContext.js  ← Real-time connection
        ├── components/
        │   ├── matching/
        │   │   └── MatchResults.js   ← Team cards + score breakdown + explainability
        │   ├── chat/
        │   │   └── ChatAssistant.js  ← Floating AI chat widget
        │   └── notifications/
        │       └── NotificationsPanel.js  ← Dropdown with badge count
        └── pages/
            └── Dashboard.js      ← Match Me button + results + chat + resume data
```

---

## API Reference (New Endpoints)

### Matching
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/match` | Run AI matching (body: `{ teamSize: 4 }`) |
| GET | `/api/match/history` | Get past team suggestions |
| POST | `/api/match/accept` | Accept a team (`{ teamId }`) |
| POST | `/api/match/reject` | Reject a team (`{ teamId }`) |
| POST | `/api/match/rebalance` | Suggest improved composition (`{ teamId, memberIds }`) |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Send message to AI assistant (`{ message }`) |
| DELETE | `/api/chat/history` | Clear conversation |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get all notifications |
| PUT | `/api/notifications/read-all` | Mark all as read |
| PUT | `/api/notifications/:id/read` | Mark one as read |
| DELETE | `/api/notifications/all` | Clear all |

### Profile (Updated)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/profile/resume` | Upload PDF → auto-parse + skill extraction |

---

## AI Scoring Formula

```
Team Score = w1 × Skill Complementarity
           + w2 × Experience Balance
           + w3 × Skill Diversity
           + w4 × Interest Alignment

Weights: w1=0.35, w2=0.25, w3=0.25, w4=0.15

Skill Complementarity: unique_categories / total_categories × (1 - redundancy × 0.4)
Experience Balance:    1 - |std(levels) - 0.7| × 0.5 × (1 - |avg - 2| × 0.3)
Leader Score:          0.4 × experience + 0.3 × projects + 0.2 × skill_diversity + 0.1 × history
```

---

## Real-Time Events (Socket.io)

| Event (server → client) | Payload |
|---|---|
| `team_matched` | `{ message, score, teamId }` |
| `team_updated` | `{ message }` |
| `notification` | `{ type, title, message }` |
| `online_count` | `{ count }` |

---

## Demo Flow

1. Register at `http://localhost:3000/register`
2. Build profile: add skills, bio, projects, upload resume
3. Dashboard → click **⚡ Match Me**
4. AI generates 3 team options with score breakdown
5. See "Why this team works" explanation
6. Accept/reject — AI-selected leader highlighted
7. Get real-time notification via WebSocket
8. Ask the **🤖 AI Assistant**: "What role should I take?"

---

## Optional: Seed Demo Users

```bash
npm run seed
# Creates: demo@hackmatch.dev / Demo1234 + 2 more users
```
