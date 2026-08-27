# fluentfeed-round1

AI-powered English speaking evaluation system. Users speak on a topic, and Gemini AI evaluates their **Grammar**, **Vocabulary**, and **Overall** communication, providing actionable improvement suggestions.

---
<img width="2875" height="1650" alt="1001035232" src="https://github.com/user-attachments/assets/86d34afe-7f15-41d4-9c3f-86ce29732b95" />
<img width="2686" height="1578" alt="1001035230" src="https://github.com/user-attachments/assets/640c5491-7b73-447d-83fd-8c42cb16c74e" />
<img width="2857" height="1485" alt="1001035231" src="https://github.com/user-attachments/assets/1969d3e9-3595-47db-a331-2f0d7d6730c6" />
<img width="2814" height="1622" alt="1001035233" src="https://github.com/user-attachments/assets/5574d26a-6704-4e7b-add0-264e73644a49" />
<img width="2854" height="1625" alt="1001035228" src="https://github.com/user-attachments/assets/4118c827-e848-42bc-9795-1a1e409b649c" />
<img width="2849" height="1538" alt="1001035229" src="https://github.com/user-attachments/assets/d00044d2-cbf3-40c8-9e7f-ea943992fc47" />

##  Project Structure

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
└── README.md               



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



