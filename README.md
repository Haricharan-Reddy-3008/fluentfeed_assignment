# FluentFeed — Speaking Evaluation Platform

AI-powered English speaking evaluation system. Users speak on a topic, and Gemini AI evaluates their **Grammar**, **Vocabulary**, and **Overall** communication, providing actionable improvement suggestions.

---

## 📁 Project Structure

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
├── technical-document.html # Full system architecture & limitations report
└── README.md               # This file
```

---

## 🚀 Getting Started

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

## 🔑 Features

- **Auth**: Register / Login stored securely in backend `users.json`
- **Speech Recognition**: Browser Web Speech API (Chrome recommended)
- **AI Evaluation**: Gemini AI scores Grammar, Vocabulary, and Overall (out of 10)
- **Suggestions**: 4 actionable improvement tips per evaluation
- **History**: Past evaluations stored in browser localStorage
- **Dark Mode UI**: Glassmorphism design with animated score rings

---

## 🛠 Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | HTML, CSS, Vanilla JS   |
| Backend   | Node.js, Express        |
| AI        | Google Gemini API       |
| Auth      | Custom (users.json)     |
| Speech    | Web Speech API          |

---

## ⚙️ API Endpoints

| Method | Route       | Description              |
|--------|-------------|--------------------------|
| POST   | /register   | Create a new user account |
| POST   | /login      | Authenticate a user       |
| POST   | /evaluate   | Evaluate speech via Gemini|

---

## 📄 Technical Document

Open `technical-document.html` in any browser for the full system design report covering:
- Limitations of direct Gemini API usage
- Scalable architecture for 10,000 evaluations/day
- Cost analysis, caching strategy, and deployment plan
