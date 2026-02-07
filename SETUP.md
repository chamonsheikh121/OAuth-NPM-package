# Google Auth NPM Package

## Quick Start Guide

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Configure consent screen if prompted
   - Application type: "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback` (for development)
     - Your production callback URL
   - Save your Client ID and Client Secret

### 2. Install Package

```bash
npm install @chamonali/google-auth
```

### 3. Install Dependencies for Examples

```bash
npm install express express-session dotenv
npm install --save-dev @types/express @types/express-session
```

### 4. Setup Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### 5. Run Example

**TypeScript Example:**
```bash
npx ts-node examples/express-example.ts
```

**JavaScript Example:**
```bash
node examples/simple-example.js
```

Visit: `http://localhost:3000`

## Features Included

✅ Google OAuth 2.0 Authentication
✅ User Profile Retrieval
✅ Token Management (Access, Refresh, Revoke)
✅ Express Middleware for Protected Routes
✅ Session Management Example
✅ TypeScript Support

## Common Issues

### "redirect_uri_mismatch" Error
Make sure the redirect URI in your `.env` file exactly matches one of the authorized redirect URIs in Google Cloud Console.

### "invalid_client" Error
Double-check your Client ID and Client Secret are correct.

### Port Already in Use
Change the PORT in `.env` file to a different port number.

## Next Steps

1. Customize the UI in the examples
2. Add database integration to store user data
3. Implement JWT tokens for API authentication
4. Add more OAuth scopes if needed
5. Deploy to production with HTTPS

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Express Session Documentation](https://github.com/expressjs/session)
- [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)
