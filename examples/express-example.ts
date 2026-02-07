import express, { Request, Response } from 'express';
import session from 'express-session';
import { GoogleAuth } from '../src/GoogleAuth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session middleware setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Initialize Google Auth
const googleAuth = new GoogleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

// Home route
app.get('/', (req: Request, res: Response) => {
  const user = (req.session as any).user;
  
  if (user) {
    res.send(`
      <h1>Welcome, ${user.name}!</h1>
      <img src="${user.picture}" alt="Profile" style="border-radius: 50%; width: 100px;">
      <p>Email: ${user.email}</p>
      <a href="/dashboard">Dashboard</a> | 
      <a href="/logout">Logout</a>
    `);
  } else {
    res.send(`
      <h1>Google Authentication Example</h1>
      <a href="/auth/google">
        <button style="padding: 10px 20px; font-size: 16px;">
          Login with Google
        </button>
      </a>
    `);
  }
});

// Start Google OAuth flow
app.get('/auth/google', (req: Request, res: Response) => {
  const authUrl = googleAuth.getAuthUrl();
  res.redirect(authUrl);
});

// Google OAuth callback
app.get('/auth/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect('/?error=no_code');
    }

    // Get tokens from authorization code
    const tokens = await googleAuth.getTokens(code as string);
    
    // Get user profile
    const userProfile = await googleAuth.getUserProfile(tokens.access_token!);
    
    // Save to session
    (req.session as any).tokens = tokens;
    (req.session as any).user = userProfile;
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Authentication error:', error);
    res.redirect('/?error=auth_failed');
  }
});

// Dashboard - Protected route
app.get('/dashboard', (req: Request, res: Response) => {
  const user = (req.session as any).user;
  
  if (!user) {
    return res.redirect('/');
  }

  res.send(`
    <h1>Dashboard</h1>
    <h2>Welcome, ${user.name}!</h2>
    <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; max-width: 500px;">
      <img src="${user.picture}" alt="Profile" style="border-radius: 50%; width: 100px;">
      <h3>Profile Information</h3>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>User ID:</strong> ${user.id}</p>
      <p><strong>Email Verified:</strong> ${user.verified_email ? 'Yes' : 'No'}</p>
    </div>
    <br>
    <a href="/">Home</a> | 
    <a href="/logout">Logout</a>
  `);
});

// API endpoint example - Protected with middleware
app.get('/api/me', googleAuth.middleware(), (req: Request, res: Response) => {
  res.json({
    user: (req as any).user,
  });
});

// Logout
app.get('/logout', async (req: Request, res: Response) => {
  const tokens = (req.session as any).tokens;
  
  // Revoke token on Google's side
  if (tokens?.access_token) {
    try {
      await googleAuth.revokeToken(tokens.access_token);
    } catch (error) {
      console.error('Error revoking token:', error);
    }
  }
  
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Login at: http://localhost:${PORT}`);
});
