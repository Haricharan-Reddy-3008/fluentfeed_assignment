# fluentfeed-round1

AI-powered English speaking evaluation system. Users speak on a topic, and Gemini AI evaluates their **Grammar**, **Vocabulary**, and **Overall** communication, providing actionable improvement suggestions.

---

##  Project Structure
<img width="2849" height="1538" alt="1001035229" src="https://github.com/user-attachments/assets/67e06a39-cfcd-42d7-9350-5ab2bc08ea38" />
<img width="2854" height="1625" alt="1001035228" src="https://github.com/user-attachments/assets/1c2e34c5-621f-44b5-8275-77fbcffe56e6" />
<img width="2814" height="1622" alt="1001035233" src="https://github.com/user-attachments/assets/c3fc541c-b4a3-44e8-a042-f94b1971f89c" />
<img width="2857" height="1485" alt="1001035231" src="https://github.com/user-attachments/assets/71c7de48-5504-4dd8-9f02-f811b1573d1a" />
<img width="2686" height="1578" alt="1001035230" src="https://github.com/user-attachments/assets/bdf314d4-5f9a-4a05-8d5d-49371a51a20b" />
<img width="2875" height="1650" alt="1001035232" src="https://github.com/user-attachments/assets/4e8217e2-5f40-48e7-adf1-f18229b2efb4" />

```
fluentfeedassgn/
├── frontend/               # Client-side web application
│   ├── index.html          # Main SPA shell
│   ├── app.js              # All frontend logic (auth, speech, evaluation)
│   └── styles.css          # Full design system (dark mode, glassmorphism)
│
├── backend/                # Node.js Express server
│   ├── server.js           # API routes: /register, /login, /evaluate
│   ├── package.json        # Dependencies
│   ├── .env                # Secret config (API key, port) — NOT committed
│   └── users.json          # Local user store (auto-created)
│
├
└── README.md               # This file
```

---

##  Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXX
PORT=3000
```
> Get a free key at https://aistudio.google.com/app/apikey

Start the server:
```bash
node server.js
```

### 2. Frontend

Open `frontend/index.html` directly in **Google Chrome** (required for Web Speech API).

---

##  Features

- **Auth**: Register / Login stored securely in backend `users.json`
- **Speech Recognition**: Browser Web Speech API (Chrome recommended)
- **AI Evaluation**: Gemini AI scores Grammar, Vocabulary, and Overall (out of 10)
- **Suggestions**: 4 actionable improvement tips per evaluation
- **History**: Past evaluations stored in browser localStorage
- **Dark Mode UI**: Glassmorphism design with animated score rings

---

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | HTML, CSS, Vanilla JS   |
| Backend   | Node.js, Express        |
| AI        | Google Gemini API       |
| Auth      | Custom (users.json)     |
| Speech    | Web Speech API          |

---

## API Endpoints

| Method | Route       | Description              |
|--------|-------------|--------------------------|
| POST   | /register   | Create a new user account |
| POST   | /login      | Authenticate a user       |
| POST   | /evaluate   | Evaluate speech via Gemini|

---



