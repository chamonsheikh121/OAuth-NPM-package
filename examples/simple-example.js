const express = require('express');
const session = require('express-session');
const { GoogleAuth } = require('@chamonali/google-auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Initialize Google Auth
const googleAuth = new GoogleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

// Routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.send(`<h1>Welcome ${req.session.user.name}!</h1><a href="/logout">Logout</a>`);
  } else {
    res.send('<h1>Home</h1><a href="/auth/google">Login with Google</a>');
  }
});

app.get('/auth/google', (req, res) => {
  const authUrl = googleAuth.getAuthUrl();
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await googleAuth.getTokens(code);
    const user = await googleAuth.getUserProfile(tokens.access_token);
    
    req.session.tokens = tokens;
    req.session.user = user;
    
    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).send('Authentication failed');
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.json({ user: req.session.user });
});

app.get('/logout', async (req, res) => {
  if (req.session.tokens?.access_token) {
    await googleAuth.revokeToken(req.session.tokens.access_token);
  }
  req.session.destroy(() => res.redirect('/'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
