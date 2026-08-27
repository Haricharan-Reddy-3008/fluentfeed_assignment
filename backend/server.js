require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');

function getUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Auth Routes
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
  
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }
  
  const newUser = { id: Date.now().toString(), name, email, password };
  users.push(newUser);
  saveUsers(users);
  
  res.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

// Evaluate Route
app.post('/evaluate', async (req, res) => {
  try {
    const { transcript, topic } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in .env file' });
    }

    const targetModel = 'gemini-3.6-flash';
    const headers = { 'Content-Type': 'application/json' };
    let url;

    if (apiKey.startsWith('AIza')) {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    } else {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const prompt = `
You are an expert English language coach evaluating a student's spoken English response.

TOPIC: "${topic}"

STUDENT'S RESPONSE (${transcript.split(/\s+/).filter(Boolean).length} words):
"${transcript}"

Evaluate the response on these three criteria, each scored out of 10:
1. Grammar — accuracy of sentence structure, tense, subject-verb agreement, articles, etc.
2. Vocabulary — richness, appropriateness, range and variety of words used.
3. Overall — holistic communication score considering fluency, coherence, and topic relevance.

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "grammar": {
    "score": <number>,
    "label": "<one of: Needs Work | Fair | Good | Excellent>",
    "analysis": "<2-3 sentence detailed grammar analysis>"
  },
  "vocabulary": {
    "score": <number>,
    "label": "<one of: Needs Work | Fair | Good | Excellent>",
    "analysis": "<2-3 sentence detailed vocabulary analysis>"
  },
  "overall": {
    "score": <number>,
    "label": "<one of: Needs Work | Fair | Good | Excellent>",
    "analysis": "<2-3 sentence overall evaluation>"
  },
  "suggestions": [
    "<specific, actionable suggestion 1>",
    "<specific, actionable suggestion 2>"
  ]
}
`.trim();

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('Empty response from Gemini API.');

    // Robust JSON extraction — strip markdown fences, find the JSON object
    let cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    
    // Find the first { and last } to extract just the JSON object
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found in Gemini response.');
    cleaned = cleaned.substring(start, end + 1);

    const parsed = JSON.parse(cleaned);
    res.json(parsed);

  } catch (error) {
    console.error('Backend Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
