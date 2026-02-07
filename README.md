# @chamonali/google-auth

সহজে যেকোনো Node.js প্রজেক্টে Google OAuth Authentication যোগ করুন।

## ✨ Features

- 🚀 সহজ সেটআপ এবং ব্যবহার
- 🔒 Secure OAuth2 Authentication
- 📦 TypeScript Support
- 🛡️ Express Middleware অন্তর্ভুক্ত
- ⚡ Token Management (Access, Refresh, Revoke)
- 👤 User Profile Information
- 🔐 ID Token Verification

## 📦 Installation

```bash
npm install @chamonali/google-auth
```

অথবা

```bash
yarn add @chamonali/google-auth
```

## 🔧 Setup

### 1. Google Cloud Console এ যান

1. [Google Cloud Console](https://console.cloud.google.com/) এ যান
2. একটি নতুন প্রজেক্ট তৈরি করুন অথবা বিদ্যমান প্রজেক্ট সিলেক্ট করুন
3. "APIs & Services" > "Credentials" এ যান
4. "Create Credentials" > "OAuth 2.0 Client ID" ক্লিক করুন
5. Application type হিসেবে "Web application" সিলেক্ট করুন
6. Authorized redirect URIs যোগ করুন (যেমন: `http://localhost:3000/auth/google/callback`)
7. আপনার **Client ID** এবং **Client Secret** সেভ করুন

### 2. Environment Variables সেট করুন

`.env` ফাইল তৈরি করুন:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## 🚀 Usage

### Basic Example (Express.js)

```typescript
import express from 'express';
import { GoogleAuth } from '@chamonali/google-auth';

const app = express();

// Google Auth Initialize করুন
const googleAuth = new GoogleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

// Login route - Google এ redirect করবে
app.get('/auth/google', (req, res) => {
  const authUrl = googleAuth.getAuthUrl();
  res.redirect(authUrl);
});

// Callback route - Google থেকে redirect হয়ে আসবে
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // Authorization code দিয়ে tokens পান
    const tokens = await googleAuth.getTokens(code as string);
    
    // User profile information পান
    const userProfile = await googleAuth.getUserProfile(tokens.access_token!);
    
    console.log('User Profile:', userProfile);
    
    // এখানে আপনার session/JWT logic যোগ করুন
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
  // req.user এ authenticated user এর তথ্য পাবেন
  res.json({ user: (req as any).user });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### JavaScript Example

```javascript
const express = require('express');
const { GoogleAuth } = require('@chamonali/google-auth');

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
Google OAuth authorization URL generate করে।

```typescript
const authUrl = googleAuth.getAuthUrl();
```

#### `getTokens(code: string): Promise<Tokens>`
Authorization code থেকে access token এবং refresh token পায়।

```typescript
const tokens = await googleAuth.getTokens(authorizationCode);
```

#### `getUserProfile(accessToken: string): Promise<UserProfile>`
User এর profile information পায়।

```typescript
const profile = await googleAuth.getUserProfile(accessToken);
// Returns: { id, email, name, picture, verified_email }
```

#### `verifyIdToken(idToken: string): Promise<TokenPayload>`
ID token verify করে।

```typescript
const payload = await googleAuth.verifyIdToken(idToken);
```

#### `refreshAccessToken(refreshToken: string): Promise<Credentials>`
Refresh token ব্যবহার করে নতুন access token পায়।

```typescript
const newTokens = await googleAuth.refreshAccessToken(refreshToken);
```

#### `revokeToken(token: string): Promise<boolean>`
Token revoke করে (logout)।

```typescript
await googleAuth.revokeToken(accessToken);
```

#### `middleware(): ExpressMiddleware`
Express route protect করার জন্য middleware।

```typescript
app.get('/protected', googleAuth.middleware(), (req, res) => {
  res.json({ user: req.user });
});
```

## 🔐 Custom Scopes

যদি অতিরিক্ত permissions প্রয়োজন হয়:

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
import { GoogleAuth } from '@chamonali/google-auth';

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
    
    // Session এ save করুন
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

Package টি সম্পূর্ণ TypeScript support সহ আসে:

```typescript
import { GoogleAuth, GoogleAuthConfig, UserProfile } from '@chamonali/google-auth';

const config: GoogleAuthConfig = {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'http://localhost:3000/callback',
};

const googleAuth = new GoogleAuth(config);
```

## ⚠️ Security Best Practices

1. **Environment Variables**: সবসময় credentials `.env` ফাইলে রাখুন
2. **HTTPS**: Production এ শুধুমাত্র HTTPS ব্যবহার করুন
3. **Token Storage**: Secure storage (httpOnly cookies/encrypted session) ব্যবহার করুন
4. **CSRF Protection**: CSRF protection implement করুন
5. **Token Expiry**: Access token expire হলে refresh token ব্যবহার করুন

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! দয়া করে PR খুলুন।

## 📧 Support

কোনো সমস্যা হলে [GitHub Issues](https://github.com/chamonali/google-auth/issues) এ জানান।

---

**Made with ❤️ by Chamonali**
