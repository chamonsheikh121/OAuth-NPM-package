# @chamonali121/google-auth

Easily add Google OAuth Authentication to any Node.js project.

## ✨ Features

- 🚀 Easy setup and usage
- 🔒 Secure OAuth2 Authentication
- 📦 TypeScript Support
- 🛡️ Express Middleware included
- ⚡ Token Management (Access, Refresh, Revoke)
- 👤 User Profile Information
- 🔐 ID Token Verification

## 📦 Installation

```bash
npm install @chamonali121/google-auth
```

Or with Yarn:

```bash
yarn add @chamonali121/google-auth
```

## 🔧 Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Select "Web application" as the application type
6. Add authorized redirect URIs (e.g., `http://localhost:3000/auth/google/callback`)
7. Save your **Client ID** and **Client Secret**

### 2. Set Environment Variables

Create a `.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## 🚀 Usage

### Basic Example (Express.js)

```typescript
import express from 'express';
import { GoogleAuth } from '@chamonali121/google-auth';

const app = express();

// Initialize Google Auth
const googleAuth = new GoogleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

// Login route - redirects to Google
app.get('/auth/google', (req, res) => {
  const authUrl = googleAuth.getAuthUrl();
  res.redirect(authUrl);
});

// Callback route - Google redirects back here
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // Get tokens using authorization code
    const tokens = await googleAuth.getTokens(code as string);
    
    // Get user profile information
    const userProfile = await googleAuth.getUserProfile(tokens.access_token!);
    
    console.log('User Profile:', userProfile);
    
    // Add your session/JWT logic here
    // req.session.user = userProfile;
    
    res.json({
      message: 'Authentication successful!',
      user: userProfile,
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Protected route example
app.get('/profile', googleAuth.middleware(), (req, res) => {
  // Access authenticated user info via req.user
  res.json({ user: (req as any).user });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### JavaScript Example

```javascript
const express = require('express');
const { GoogleAuth } = require('@chamonali121/google-auth');

const app = express();

const googleAuth = new GoogleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

app.get('/auth/google', (req, res) => {
  const authUrl = googleAuth.getAuthUrl();
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await googleAuth.getTokens(code);
    const userProfile = await googleAuth.getUserProfile(tokens.access_token);
    
    res.json({
      message: 'Login successful!',
      user: userProfile,
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.listen(3000);
```

## 📚 API Reference

### Constructor

```typescript
const googleAuth = new GoogleAuth({
  clientId: string;        // Google Client ID (required)
  clientSecret: string;    // Google Client Secret (required)
  redirectUri: string;     // Redirect URI (required)
  scopes?: string[];       // Optional custom scopes
});
```

### Methods

#### `getAuthUrl(): string`
Generates Google OAuth authorization URL.

```typescript
const authUrl = googleAuth.getAuthUrl();
```

#### `getTokens(code: string): Promise<Tokens>`
Exchanges authorization code for access and refresh tokens.

```typescript
const tokens = await googleAuth.getTokens(authorizationCode);
```

#### `getUserProfile(accessToken: string): Promise<UserProfile>`
Retrieves user profile information.

```typescript
const profile = await googleAuth.getUserProfile(accessToken);
// Returns: { id, email, name, picture, verified_email }
```

#### `verifyIdToken(idToken: string): Promise<TokenPayload>`
Verifies ID token.

```typescript
const payload = await googleAuth.verifyIdToken(idToken);
```

#### `refreshAccessToken(refreshToken: string): Promise<Credentials>`
Uses refresh token to get a new access token.

```typescript
const newTokens = await googleAuth.refreshAccessToken(refreshToken);
```

#### `revokeToken(token: string): Promise<boolean>`
Revokes token (logout).

```typescript
await googleAuth.revokeToken(accessToken);
```

#### `middleware(): ExpressMiddleware`
Middleware to protect Express routes.

```typescript
app.get('/protected', googleAuth.middleware(), (req, res) => {
  res.json({ user: req.user });
});
```

## 🔐 Custom Scopes

If you need additional permissions:

```typescript
const googleAuth = new GoogleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar.readonly', // Calendar access
  ],
});
```

## 📝 Complete Example with Session

```typescript
import express from 'express';
import session from 'express-session';
import { GoogleAuth } from '@chamonali121/google-auth';

const app = express();

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

const googleAuth = new GoogleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

app.get('/auth/google', (req, res) => {
  res.redirect(googleAuth.getAuthUrl());
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const tokens = await googleAuth.getTokens(req.query.code as string);
    const user = await googleAuth.getUserProfile(tokens.access_token!);
    
    // Save to session
    (req.session as any).tokens = tokens;
    (req.session as any).user = user;
    
    res.redirect('/dashboard');
  } catch (error) {
    res.redirect('/login?error=auth_failed');
  }
});

app.get('/logout', async (req, res) => {
  const tokens = (req.session as any).tokens;
  if (tokens?.access_token) {
    await googleAuth.revokeToken(tokens.access_token);
  }
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(3000);
```

## 🛠️ TypeScript Support

This package comes with full TypeScript support:

```typescript
import { GoogleAuth, GoogleAuthConfig, UserProfile } from '@chamonali121/google-auth';

const config: GoogleAuthConfig = {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'http://localhost:3000/callback',
};

const googleAuth = new GoogleAuth(config);
```

## ⚠️ Security Best Practices

1. **Environment Variables**: Always store credentials in a `.env` file
2. **HTTPS**: Use HTTPS only in production
3. **Token Storage**: Use secure storage (httpOnly cookies/encrypted sessions)
4. **CSRF Protection**: Implement CSRF protection
5. **Token Expiry**: Use refresh tokens when access tokens expire

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open a PR.

## 📧 Support

If you encounter any issues, please report them on [GitHub Issues](https://github.com/chamonali/google-auth/issues).

---

**Made with ❤️ by Chamonali**
