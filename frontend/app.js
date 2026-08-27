// app.js — FluentFeed Speaking Evaluation System
// Main application controller: Auth, routing, evaluation, history
// ─────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════
//  CONSTANTS & STATE
// ══════════════════════════════════════════════════════════════

const TOPICS = [
  "Describe the most memorable trip you have ever taken and what made it special.",
  "Do you think social media has a positive or negative impact on society? Explain your view.",
  "What do you consider the most important quality a leader should have, and why?",
  "Talk about a skill you recently learned and how it changed your perspective.",
  "Should schools replace traditional exams with project-based assessments? Give your opinion.",
  "Describe your ideal work environment and the kind of work that motivates you.",
  "How has technology changed the way families communicate and spend time together?",
  "What is one global problem you feel most passionate about solving, and why?",
  "Talk about a book, film, or piece of music that has significantly influenced your thinking.",
  "Do you think remote work is the future of employment? Discuss its pros and cons.",
  "Describe a challenge you overcame and what you learned from that experience.",
  "How important is learning a second language in today's globalised world?",
  "Talk about a person who has inspired you and explain what makes them remarkable.",
  "Should governments prioritise economic growth or environmental protection? Discuss.",
  "Describe your morning routine and explain how it affects the rest of your day.",
  "Talk Something you wish",
];

const state = {
  currentPage:    'auth',
  currentTopic:   '',
  transcript:     '',
  isRecording:    false,
  recognition:    null,
  timerInterval:  null,
  elapsedSeconds: 0,
  evaluation:     null,
  isDemoMode:     false,   // true when Firebase config is placeholder
};

// ══════════════════════════════════════════════════════════════
//  DOM REFERENCES
// ══════════════════════════════════════════════════════════════

const $ = id => document.getElementById(id);

const DOM = {
  pages:             document.querySelectorAll('.page'),
  navbar:            $('navbar'),
  // Auth
  tabLogin:          $('tab-login'),
  tabSignup:         $('tab-signup'),
  panelLogin:        $('panel-login'),
  panelSignup:       $('panel-signup'),
  loginEmail:        $('login-email'),
  loginPassword:     $('login-password'),
  loginError:        $('login-error'),
  btnLogin:          $('btn-login'),
  signupName:        $('signup-name'),
  signupEmail:       $('signup-email'),
  signupPassword:    $('signup-password'),
  signupConfirm:     $('signup-confirm'),
  signupError:       $('signup-error'),
  btnSignup:         $('btn-signup'),
  // Nav
  btnLogout:         $('btn-logout'),
  userAvatar:        $('user-avatar'),
  navTabs:           document.querySelectorAll('.nav-tab'),
  // Dashboard
  userNameGreeting:  $('user-name-greeting'),
  topicDisplay:      $('topic-display'),
  btnNewTopic:       $('btn-new-topic'),
  micButton:         $('mic-button'),
  micStatusText:     $('mic-status-text'),
  micTimer:          $('mic-timer'),
  micRipples:        [$('mic-ripple-1'), $('mic-ripple-2'), $('mic-ripple-3')],
  transcriptDisplay: $('transcript-display'),
  wordCountBadge:    $('word-count-badge'),
  btnClear:          $('btn-clear'),
  btnEvaluate:       $('btn-evaluate'),
  dashboardError:    $('dashboard-error'),
  // Results
  valGrammar:        $('val-grammar'),
  valVocabulary:     $('val-vocabulary'),
  valOverall:        $('val-overall'),
  ringGrammar:       $('ring-grammar'),
  ringVocabulary:    $('ring-vocabulary'),
  ringOverall:       $('ring-overall'),
  descGrammar:       $('desc-grammar'),
  descVocabulary:    $('desc-vocabulary'),
  descOverall:       $('desc-overall'),
  detailGrammar:     $('detail-grammar'),
  detailVocabulary:  $('detail-vocabulary'),
  resultTranscript:  $('result-transcript'),
  suggestionsList:   $('suggestions-list'),
  resultsTopicDisplay: $('results-topic-display'),
  btnPracticeAgain:  $('btn-practice-again'),
  btnNewTopicResults:$('btn-new-topic-results'),
  // History
  historyList:       $('history-list'),
  // Loading
  loadingOverlay:    $('loading-overlay'),
  loaderText:        $('loader-text'),
  // Toast
  toastContainer:    $('toast-container'),
};

// ══════════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════════

function showToast(message, type = 'info', duration = 4000) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ══════════════════════════════════════════════════════════════
//  PAGE ROUTING
// ══════════════════════════════════════════════════════════════

function showPage(pageName) {
  DOM.pages.forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${pageName}`);
  if (target) target.classList.add('active');
  state.currentPage = pageName;

  // Update nav tab active state
  DOM.navTabs.forEach(t => {
    t.classList.toggle('active', t.dataset.page === pageName);
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════════════════════════
//  LOADING
// ══════════════════════════════════════════════════════════════

function showLoading(text = 'Analyzing your speech…') {
  DOM.loaderText.textContent = text;
  DOM.loadingOverlay.classList.add('visible');
}

function hideLoading() {
  DOM.loadingOverlay.classList.remove('visible');
}

// ══════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════

function clearAuthErrors() {
  DOM.loginError.classList.add('hidden');
  DOM.signupError.classList.add('hidden');
}

function showAuthError(panel, message) {
  const el = panel === 'login' ? DOM.loginError : DOM.signupError;
  el.textContent = message;
  el.classList.remove('hidden');
}

function friendlyAuthError(code) {
  const map = {
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password. Please try again.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/email-already-in-use':   'An account with this email already exists.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user':   'Sign-in was cancelled.',
    'auth/invalid-credential':     'Invalid email or password.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

function setButtonLoading(btn, loading) {
  btn.disabled = loading;
  btn.dataset.original = btn.dataset.original || btn.textContent;
  btn.textContent = loading ? 'Please wait…' : btn.dataset.original;
}

// Auth tab switching
DOM.tabLogin.addEventListener('click',  () => switchAuthTab('login'));
DOM.tabSignup.addEventListener('click', () => switchAuthTab('signup'));

DOM.tabLogin.addEventListener('keydown', e => e.key === 'Enter' && switchAuthTab('login'));
DOM.tabSignup.addEventListener('keydown', e => e.key === 'Enter' && switchAuthTab('signup'));

function switchAuthTab(tab) {
  clearAuthErrors();
  DOM.tabLogin.classList.toggle('active', tab === 'login');
  DOM.tabSignup.classList.toggle('active', tab === 'signup');
  DOM.panelLogin.classList.toggle('active', tab === 'login');
  DOM.panelSignup.classList.toggle('active', tab === 'signup');
}

// Login
DOM.btnLogin.addEventListener('click', async () => {
  clearAuthErrors();
  const email    = DOM.loginEmail.value.trim();
  const password = DOM.loginPassword.value;

  if (!email || !password) {
    showAuthError('login', 'Please fill in both fields.');
    return;
  }

  if (state.isDemoMode) {
    // Demo mode — skip Firebase
    onUserLoggedIn({ displayName: 'Demo User', email });
    return;
  }

  setButtonLoading(DOM.btnLogin, true);
  try {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    onUserLoggedIn({ displayName: data.user.name, email: data.user.email });
  } catch (e) {
    showAuthError('login', e.message);
  } finally {
    setButtonLoading(DOM.btnLogin, false);
  }
});

// Enter key on login fields
[DOM.loginEmail, DOM.loginPassword].forEach(input => {
  input.addEventListener('keydown', e => { if (e.key === 'Enter') DOM.btnLogin.click(); });
});

// Google Login Removed

// Signup
DOM.btnSignup.addEventListener('click', async () => {
  clearAuthErrors();
  const name     = DOM.signupName.value.trim();
  const email    = DOM.signupEmail.value.trim();
  const password = DOM.signupPassword.value;
  const confirm  = DOM.signupConfirm.value;

  if (!name || !email || !password || !confirm) {
    showAuthError('signup', 'Please fill in all fields.');
    return;
  }
  if (password !== confirm) {
    showAuthError('signup', 'Passwords do not match.');
    DOM.signupConfirm.classList.add('error');
    return;
  }
  DOM.signupConfirm.classList.remove('error');

  if (state.isDemoMode) {
    onUserLoggedIn({ displayName: name, email });
    return;
  }

  setButtonLoading(DOM.btnSignup, true);
  try {
    const res = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    onUserLoggedIn({ displayName: data.user.name, email: data.user.email });
  } catch (e) {
    showAuthError('signup', e.message);
  } finally {
    setButtonLoading(DOM.btnSignup, false);
  }
});

// Logout
DOM.btnLogout.addEventListener('click', async () => {
  stopRecording();
  onUserLoggedOut();
});

// ── Auth state observer ──────────────────────────────────────
const savedUser = localStorage.getItem('ff_user');
if (savedUser) {
  onUserLoggedIn(JSON.parse(savedUser));
}

function onUserLoggedIn(user) {
  localStorage.setItem('ff_user', JSON.stringify(user));
  const displayName = user.displayName || user.email?.split('@')[0] || 'Learner';
  DOM.userAvatar.textContent = displayName.charAt(0).toUpperCase();
  DOM.userNameGreeting.textContent = displayName;

  DOM.navbar.classList.remove('hidden');
  setTopic(randomTopic());
  loadHistory();
  showPage('dashboard');
}

function onUserLoggedOut() {
  localStorage.removeItem('ff_user');
  DOM.navbar.classList.add('hidden');
  showPage('auth');
  DOM.loginEmail.value    = '';
  DOM.loginPassword.value = '';
  DOM.signupName.value    = '';
  DOM.signupEmail.value   = '';
  DOM.signupPassword.value = '';
  DOM.signupConfirm.value  = '';
}

// ══════════════════════════════════════════════════════════════
//  NAV TABS
// ══════════════════════════════════════════════════════════════

DOM.navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const page = tab.dataset.page;
    if (page === 'history') loadHistory();
    showPage(page);
  });
});

// Settings Removed

// ══════════════════════════════════════════════════════════════
//  TOPIC MANAGEMENT
// ══════════════════════════════════════════════════════════════

function randomTopic() {
  const filtered = TOPICS.filter(t => t !== state.currentTopic);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function setTopic(topic) {
  state.currentTopic = topic;
  DOM.topicDisplay.textContent = topic;
}

DOM.btnNewTopic.addEventListener('click', () => {
  setTopic(randomTopic());
  resetDashboard();
  showToast('New topic loaded!', 'info', 2000);
});

// ══════════════════════════════════════════════════════════════
//  SPEECH RECOGNITION
// ══════════════════════════════════════════════════════════════

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

function initRecognition() {
  if (!SpeechRecognition) return null;

  const rec = new SpeechRecognition();
  rec.continuous      = true;
  rec.interimResults  = true;
  rec.lang            = 'en-US';
  rec.maxAlternatives = 1;

  let finalTranscript = '';

  rec.onstart = () => {
    finalTranscript = state.transcript;
  };

  rec.onresult = event => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += chunk + ' ';
      } else {
        interim = chunk;
      }
    }
    const full = (finalTranscript + interim).trim();
    updateTranscript(full);
  };

  rec.onerror = e => {
    if (e.error === 'no-speech') return;
    console.warn('Speech recognition error:', e.error);
    if (e.error === 'not-allowed') {
      showToast('Microphone access denied. Please allow mic in browser settings.', 'error', 6000);
      stopRecording();
    }
  };

  rec.onend = () => {
    if (state.isRecording) {
      // Auto-restart for continuous recording
      try { rec.start(); } catch (_) {}
    }
  };

  return rec;
}

function updateTranscript(text) {
  state.transcript = text;
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  DOM.transcriptDisplay.textContent = text || 'Your spoken words will appear here in real time as you speak…';
  DOM.transcriptDisplay.classList.toggle('populated', !!text);

  // Word count badge
  DOM.wordCountBadge.textContent = `${words} word${words !== 1 ? 's' : ''}`;
  DOM.wordCountBadge.className = 'word-count-badge';
  if (words >= 100 && words <= 200) DOM.wordCountBadge.classList.add('ok');
  else if (words > 0)               DOM.wordCountBadge.classList.add('short');

  DOM.btnClear.disabled    = !text;
  DOM.btnEvaluate.disabled = words < 10;
}

// Timer
function startTimer() {
  state.elapsedSeconds = 0;
  DOM.micTimer.textContent = '0:00';
  DOM.micTimer.className   = 'mic-timer';

  state.timerInterval = setInterval(() => {
    state.elapsedSeconds++;
    const m = Math.floor(state.elapsedSeconds / 60);
    const s = state.elapsedSeconds % 60;
    DOM.micTimer.textContent = `${m}:${s.toString().padStart(2, '0')}`;

    // Color feedback
    DOM.micTimer.className = 'mic-timer';
    if (state.elapsedSeconds >= 90)       DOM.micTimer.classList.add('danger');
    else if (state.elapsedSeconds >= 60)  DOM.micTimer.classList.add('warning');
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
}

// Recording toggle
DOM.micButton.addEventListener('click', () => {
  if (state.isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

function startRecording() {
  if (!SpeechRecognition) {
    showToast('Your browser does not support the Web Speech API. Please use Chrome or Edge.', 'error', 6000);
    return;
  }

  recognition = initRecognition();
  if (!recognition) return;

  try {
    recognition.start();
  } catch (e) {
    showToast('Could not start microphone: ' + e.message, 'error');
    return;
  }

  state.isRecording = true;
  DOM.micButton.classList.add('recording');
  DOM.micButton.setAttribute('aria-pressed', 'true');
  DOM.micButton.textContent = '⏹';
  DOM.micStatusText.textContent = 'Recording… speak clearly';

  // Show ripples
  DOM.micRipples.forEach(r => r.classList.remove('hidden'));
  startTimer();
  DOM.dashboardError.classList.add('hidden');
}

function stopRecording() {
  if (recognition) {
    try { recognition.stop(); } catch (_) {}
    recognition = null;
  }
  state.isRecording = false;
  DOM.micButton.classList.remove('recording');
  DOM.micButton.setAttribute('aria-pressed', 'false');
  DOM.micButton.textContent = '🎙';
  DOM.micStatusText.textContent = 'Tap to start recording';

  DOM.micRipples.forEach(r => r.classList.add('hidden'));
  stopTimer();

  const words = state.transcript.trim().split(/\s+/).filter(Boolean).length;
  if (words > 0) {
    DOM.btnEvaluate.disabled = words < 10;
    if (words < 10) showToast('Please speak a bit more before evaluating.', 'info');
  }
}

// Clear
DOM.btnClear.addEventListener('click', () => {
  stopRecording();
  resetDashboard(false);
});

function resetDashboard(resetTopic = false) {
  state.transcript = '';
  state.evaluation = null;
  updateTranscript('');
  DOM.micTimer.textContent = '';
  DOM.micStatusText.textContent = 'Tap to start recording';
  DOM.micButton.classList.remove('recording');
  DOM.micButton.textContent = '🎙';
  DOM.micRipples.forEach(r => r.classList.add('hidden'));
  DOM.dashboardError.classList.add('hidden');
  if (resetTopic) setTopic(randomTopic());
}

// ══════════════════════════════════════════════════════════════
//  GEMINI EVALUATION
// ══════════════════════════════════════════════════════════════

DOM.btnEvaluate.addEventListener('click', evaluateSpeech);

async function evaluateSpeech() {
  const words = state.transcript.trim().split(/\s+/).filter(Boolean).length;
  if (words < 10) {
    DOM.dashboardError.textContent = 'Please record at least 10 words before evaluating.';
    DOM.dashboardError.classList.remove('hidden');
    return;
  }

  stopRecording();
  showLoading('Gemini AI is evaluating your speech…');
  DOM.btnEvaluate.disabled = true;

  try {
    const result = await callGeminiAPI(state.transcript, state.currentTopic);
    state.evaluation = result;
    saveToHistory(state.currentTopic, state.transcript, result);
    displayResults(result);
    showPage('results');
  } catch (e) {
    console.error('Evaluation error:', e);
    let msg = `Evaluation failed: ${e.message}`;
    // Only suggest backend is down if it's a connection/network issue
    if (e.message.toLowerCase().includes('failed to fetch') || e.message.toLowerCase().includes('networkerror') || e.message.toLowerCase().includes('fetch failed')) {
      msg += '. Please make sure your Node.js backend is running (run "node server.js").';
    }
    DOM.dashboardError.textContent = msg;
    DOM.dashboardError.classList.remove('hidden');
    DOM.btnEvaluate.disabled = false;
  } finally {
    hideLoading();
  }
}

async function callGeminiAPI(transcript, topic) {
  const response = await fetch('http://localhost:3000/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, topic })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ══════════════════════════════════════════════════════════════
//  RESULTS DISPLAY
// ══════════════════════════════════════════════════════════════

const CIRCUMFERENCE = 2 * Math.PI * 35; // r=35

function animateRing(ringEl, score) {
  const offset = CIRCUMFERENCE - (score / 10) * CIRCUMFERENCE;
  requestAnimationFrame(() => {
    ringEl.style.strokeDasharray  = CIRCUMFERENCE;
    ringEl.style.strokeDashoffset = CIRCUMFERENCE;
    requestAnimationFrame(() => {
      ringEl.style.strokeDashoffset = offset;
    });
  });
}

function displayResults(data) {
  // Scores
  const { grammar, vocabulary, overall, suggestions } = data;

  DOM.valGrammar.textContent    = grammar.score;
  DOM.valVocabulary.textContent = vocabulary.score;
  DOM.valOverall.textContent    = overall.score;

  DOM.descGrammar.textContent    = grammar.label;
  DOM.descVocabulary.textContent = vocabulary.label;
  DOM.descOverall.textContent    = overall.label;

  DOM.detailGrammar.textContent    = grammar.analysis;
  DOM.detailVocabulary.textContent = vocabulary.analysis;

  DOM.resultsTopicDisplay.textContent = `Topic: "${state.currentTopic}"`;
  DOM.resultTranscript.textContent    = state.transcript;

  // Suggestions
  DOM.suggestionsList.innerHTML = '';
  (suggestions || []).forEach((sug, i) => {
    const li = document.createElement('li');
    li.className = 'suggestion-item';
    li.innerHTML = `<div class="suggestion-number">${i + 1}</div><p class="suggestion-text">${sug}</p>`;
    DOM.suggestionsList.appendChild(li);
  });

  // Animated rings
  setTimeout(() => {
    animateRing(DOM.ringGrammar,    grammar.score);
    animateRing(DOM.ringVocabulary, vocabulary.score);
    animateRing(DOM.ringOverall,    overall.score);
  }, 200);
}

// Results page actions
DOM.btnPracticeAgain.addEventListener('click', () => {
  showPage('dashboard');
  resetDashboard(false);
});

DOM.btnNewTopicResults.addEventListener('click', () => {
  showPage('dashboard');
  setTopic(randomTopic());
  resetDashboard(false);
});

// ══════════════════════════════════════════════════════════════
//  HISTORY (localStorage)
// ══════════════════════════════════════════════════════════════

const HISTORY_KEY = 'ff_history';

function saveToHistory(topic, transcript, evaluation) {
  const history = getHistory();
  history.unshift({
    id:         Date.now(),
    topic,
    transcript,
    evaluation,
    date:       new Date().toISOString(),
  });
  // Keep last 50
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function loadHistory() {
  const history = getHistory();
  DOM.historyList.innerHTML = '';

  if (!history.length) {
    DOM.historyList.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">🎙</div>
        <p class="history-empty-text">No evaluations yet</p>
        <p>Complete your first speaking evaluation to see your progress here.</p>
      </div>`;
    return;
  }

  history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'glass-card history-item fade-in';
    div.setAttribute('role', 'article');
    div.setAttribute('aria-label', `Evaluation: ${item.topic}`);

    const date = new Date(item.date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    div.innerHTML = `
      <div class="history-item-header">
        <p class="history-topic">${item.topic}</p>
        <span class="history-date">${date}</span>
      </div>
      <div class="history-scores">
        <span class="history-score-pill grammar">Grammar ${item.evaluation.grammar.score}/10</span>
        <span class="history-score-pill vocabulary">Vocab ${item.evaluation.vocabulary.score}/10</span>
        <span class="history-score-pill overall">Overall ${item.evaluation.overall.score}/10</span>
      </div>`;

    div.addEventListener('click', () => {
      state.transcript   = item.transcript;
      state.currentTopic = item.topic;
      state.evaluation   = item.evaluation;
      displayResults(item.evaluation);
      showPage('results');
    });

    DOM.historyList.appendChild(div);
  });
}

// Init Finished
