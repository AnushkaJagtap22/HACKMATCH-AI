<div align="center">
  <h1>🚀 HackMatch AI</h1>
  <p><strong>A production-grade, AI-powered hackathon team formation platform.</strong></p>
  <p>HackMatch AI leverages data-driven matching algorithms and real-time interactions to bring hackers together. Let AI connect you with the perfect teammates based on skill complementarity, experience balance, and interest alignment.</p>
</div>

---

## ✨ Features

- **🧠 AI Team Matching**: Advanced multi-dimensional scoring evaluating skill complementarity, experience balance, diversity, and interest alignment.
- **👑 Intelligent Leader Selection**: Automatically suggests a team leader based on experience, project portfolio, past history, and skill diversity.
- **💡 Explainable AI**: Every generated team includes a natural language explanation answering *"Why this team works"*.
- **📄 AI Resume Parsing**: Upload your PDF resume to have your skills and experience automatically extracted and appended to your profile.
- **🤖 AI Chat Assistant**: In-app, context-aware coaching using LLMs (with rule-based fallbacks) to guide hackers to success.
- **⚖️ Dynamic Team Rebalancing**: Suggests improved team compositions when someone leaves or joins your team.
- **🔔 Real-Time WebSockets**: Powered by Socket.io for instant match discoveries and live system notifications.
- **🛡️ Secure JWT Authentication**: Robust registration, login, and authorization.

---

## 📸 Screenshots
<img width="945" height="468" alt="image" src="https://github.com/user-attachments/assets/189dbd55-3375-4145-a39a-e48d30d34341" />
<img width="940" height="462" alt="image" src="https://github.com/user-attachments/assets/7dfbfe52-3e46-4b4a-a587-b8f7cea6dfb2" />
<img width="953" height="467" alt="image" src="https://github.com/user-attachments/assets/62e05046-dea6-417d-a0b9-01d7c118add5" />
<img width="942" height="470" alt="image" src="https://github.com/user-attachments/assets/cbe79427-ef91-49cd-8729-e28491b1106b" />
<img width="944" height="467" alt="image" src="https://github.com/user-attachments/assets/83a78f84-7faa-4c0b-b0da-a656325eac32" />
<img width="936" height="460" alt="image" src="https://github.com/user-attachments/assets/ee5005ae-d6ec-424e-8030-d11b0520ee10" />
<img width="941" height="462" alt="image" src="https://github.com/user-attachments/assets/bb69d93b-8b70-465d-8ffe-3668cbab48b8" />
<img width="934" height="467" alt="image" src="https://github.com/user-attachments/assets/17b8d192-5d26-4e2e-b3b6-5d3df77214cf" />


---

## 💻 Tech Stack

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **Real-Time Data:** Socket.io-client
- **HTTP Client:** Axios
- **UI Notifications:** React Hot Toast
- **Styling:** Custom CSS with UI/UX best practices

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB / Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Real-Time Engine:** Socket.io
- **AI Integrations:** OpenAI API (for chat)
- **File Utilities:** Multer (uploads), `pdf-parse` (resume processing)

---

## 🔬 The AI Matching Model

HackMatch evaluates compatibility using a weighted cosine-similarity engine combined with heuristic balancing:

```math
Team Score = (w1 × Complementarity) + (w2 × Experience Balance) + (w3 × Diversity) + (w4 × Alignment)
```
- **Skill Complementarity (35%)**: High score when a team covers multiple technical pillars (Frontend, Backend, AI, Data) with low overlap.
- **Experience Balance (25%)**: Prioritizes a mix of Seniority (std deviation logic) and avoids completely Beginner or exclusively Advanced teams.
- **Skill Diversity (25%)**: Awards points for breadth of knowledge across different domains.
- **Interest Alignment (15%)**: Assesses the overlap in personal interests and hobbies to foster team cohesion.

---

## 📂 Folder Structure

```text
hackmatch/
├── backend/
│   ├── config/                  # Database and core network config
│   ├── middleware/              # JWT auth guards, Multer uplodas
│   ├── models/                  # Mongoose Schemas (User: Extended with Vectors)
│   ├── routes/                  # API Routing (auth, profile, user, match, chat)
│   ├── scripts/                 # Database seeders (e.g. seed.js)
│   ├── services/
│   │   ├── matchingEngine.js    # 🧠 Core AI: scoring, team gen, leader selection
│   │   ├── resumeParser.js      # 📄 PDF text extraction + skill identification
│   │   ├── chatService.js       # 🤖 OpenAI + rule-based fallback
│   │   └── socketManager.js     # 🔌 WebSocket real-time manager
│   └── server.js                # HTTP + WebSocket Server Entry
│
└── frontend/
    ├── public/                  # Static assets
    └── src/
        ├── components/
        │   ├── chat/            # Floating AI chat widget
        │   ├── matching/        # MatchResults, score breakdowns, explainability
        │   ├── notifications/   # Global Notification popups
        │   ├── profile/         # Skill inputs, Completeness bars
        │   └── ui/              # Reusable DOM elements
        ├── context/             # AuthContext (JWT) and SocketContext
        ├── hooks/               # Custom React Hooks
        ├── pages/               # Views: Dashboard, Login, EditProfile
        ├── utils/               # Axios interception and formatting
        └── App.js               # React Router layout wrapping
```

---

## 🚀 Quick Start (Local Development)

**Prerequisites:** 
- Node.js (v18 or higher)
- MongoDB instance (Local or Atlas)
- (Optional) OpenAI API Key

### 1. Automated Setup script (Recommended)
You can set up dependencies automatically:
```bash
npm run install:all
npm run setup
```

### 2. Manual Installation
**Terminal 1 — Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGODB_URI and a JWT_SECRET
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm start
```

### 3. (Optional) Testing with Seed Data
Instantly populate the database with dummy diverse hacker profiles matching different specialties:
```bash
cd backend
node scripts/seed.js
```
*Login with `demo@hackmatch.dev` / `Demo1234`!*

---

## 🤝 Contributors
- **Vaishnavi Mekle**
- **Shravani Karhe**
- **Anushka Jagtap** *(Implicitly based on repo owner)*

---

> Built for the future of Hackathons. Happy Coding. 🚀
