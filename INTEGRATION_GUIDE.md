# Integration Guide

Complete guide for integrating `@chamonali121/google-auth` into your projects.

---

## 📦 Table of Contents

- [Express.js Integration](#expressjs-integration)
- [NestJS Integration](#nestjs-integration)
- [Common Setup](#common-setup)

---

## 🚀 Express.js Integration

### Basic Setup

#### 1. Install Dependencies

```bash
npm install @chamonali121/google-auth express express-session dotenv
npm install --save-dev @types/express @types/express-session
```

#### 2. Create `.env` File

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
SESSION_SECRET=your-random-secret-key
PORT=3000
```

#### 3. Basic Express App (TypeScript)

```typescript
// src/index.ts
import express, { Request, Response } from 'express';
import session from 'express-session';
import { GoogleAuth } from '@chamonali121/google-auth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
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

// Routes
app.get('/', (req: Request, res: Response) => {
  const user = (req.session as any).user;
  if (user) {
    res.json({
      message: 'Welcome back!',
      user: user,
    });
  } else {
    res.json({
      message: 'Welcome! Please login.',
      loginUrl: '/auth/google',
    });
  }
});

// Initiate Google OAuth flow
app.get('/auth/google', (req: Request, res: Response) => {
  const authUrl = googleAuth.getAuthUrl();
  res.redirect(authUrl);
});

// Google OAuth callback
app.get('/auth/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No authorization code' });
    }

    // Exchange code for tokens
    const tokens = await googleAuth.getTokens(code as string);

    // Get user profile
    const userProfile = await googleAuth.getUserProfile(tokens.access_token!);

    // Save to session
    (req.session as any).tokens = tokens;
    (req.session as any).user = userProfile;

    res.json({
      message: 'Authentication successful!',
      user: userProfile,
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Protected route
app.get('/profile', (req: Request, res: Response) => {
  const user = (req.session as any).user;

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({ user });
});

// Logout
app.get('/logout', async (req: Request, res: Response) => {
  const tokens = (req.session as any).tokens;

  if (tokens?.access_token) {
    try {
      await googleAuth.revokeToken(tokens.access_token);
    } catch (error) {
      console.error('Token revocation error:', error);
    }
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

#### 4. JavaScript Version

```javascript
// app.js
const express = require('express');
const session = require('express-session');
const { GoogleAuth } = require('@chamonali121/google-auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Google Auth
const googleAuth = new GoogleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

app.get('/', (req, res) => {
  if (req.session.user) {
    res.json({ message: 'Welcome!', user: req.session.user });
  } else {
    res.json({ message: 'Please login', loginUrl: '/auth/google' });
  }
});

app.get('/auth/google', (req, res) => {
  res.redirect(googleAuth.getAuthUrl());
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const tokens = await googleAuth.getTokens(req.query.code);
    const user = await googleAuth.getUserProfile(tokens.access_token);
    
    req.session.tokens = tokens;
    req.session.user = user;
    
    res.json({ message: 'Success!', user });
  } catch (error) {
    res.status(500).json({ error: 'Auth failed' });
  }
});

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

app.get('/logout', async (req, res) => {
  if (req.session.tokens?.access_token) {
    await googleAuth.revokeToken(req.session.tokens.access_token);
  }
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
```

### Advanced: Using Middleware for Protected Routes

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const user = (req.session as any).user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  next();
};

// Usage in your app
import { requireAuth } from './middleware/auth.middleware';

app.get('/dashboard', requireAuth, (req, res) => {
  res.json({ message: 'Welcome to dashboard!' });
});

app.get('/api/data', requireAuth, (req, res) => {
  const user = (req.session as any).user;
  res.json({ data: 'Secret data', user });
});
```

---

## 🐱 NestJS Integration

### Basic Setup

#### 1. Install Dependencies

```bash
npm install @chamonali121/google-auth @nestjs/passport passport express-session
npm install --save-dev @types/express-session @types/passport
```

#### 2. Create `.env` File

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
SESSION_SECRET=your-random-secret-key
PORT=3000
```

#### 3. Auth Module Structure

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   └── guards/
│       └── auth.guard.ts
├── app.module.ts
└── main.ts
```

#### 4. Create Auth Service

```typescript
// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { GoogleAuth } from '@chamonali121/google-auth';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private googleAuth: GoogleAuth;

  constructor(private configService: ConfigService) {
    this.googleAuth = new GoogleAuth({
      clientId: this.configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      redirectUri: this.configService.get<string>('GOOGLE_REDIRECT_URI')!,
    });
  }

  getAuthUrl(): string {
    return this.googleAuth.getAuthUrl();
  }

  async handleCallback(code: string) {
    const tokens = await this.googleAuth.getTokens(code);
    const userProfile = await this.googleAuth.getUserProfile(tokens.access_token!);
    
    return {
      tokens,
      user: userProfile,
    };
  }

  async getUserProfile(accessToken: string) {
    return this.googleAuth.getUserProfile(accessToken);
  }

  async revokeToken(token: string) {
    return this.googleAuth.revokeToken(token);
  }

  async verifyToken(idToken: string) {
    return this.googleAuth.verifyIdToken(idToken);
  }
}
```

#### 5. Create Auth Controller

```typescript
// src/auth/auth.controller.ts
import { Controller, Get, Query, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  async googleAuth(@Res() res: Response) {
    const authUrl = this.authService.getAuthUrl();
    return res.redirect(authUrl);
  }

  @Get('google/callback')
  async googleAuthCallback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!code) {
        return res.status(400).json({ error: 'No authorization code' });
      }

      const result = await this.authService.handleCallback(code);

      // Save to session
      (req.session as any).tokens = result.tokens;
      (req.session as any).user = result.user;

      return res.json({
        message: 'Authentication successful',
        user: result.user,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const tokens = (req.session as any).tokens;

    if (tokens?.access_token) {
      try {
        await this.authService.revokeToken(tokens.access_token);
      } catch (error) {
        console.error('Token revocation error:', error);
      }
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.json({ message: 'Logged out successfully' });
    });
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@CurrentUser() user: any) {
    return { user };
  }
}
```

#### 6. Create Auth Guard

```typescript
// src/auth/guards/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = (request.session as any)?.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
```

#### 7. Create Current User Decorator

```typescript
// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return (request.session as any)?.user;
  },
);
```

#### 8. Create Auth Module

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

#### 9. Update App Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}
```

#### 10. Configure Main.ts with Session

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
```

### Using Auth Guard in Other Modules

```typescript
// src/users/users.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@CurrentUser() user: any) {
    return {
      message: 'Current user info',
      user,
    };
  }

  @Get('dashboard')
  @UseGuards(AuthGuard)
  getDashboard(@CurrentUser() user: any) {
    return {
      message: `Welcome to dashboard, ${user.name}!`,
      data: 'Protected data',
    };
  }
}
```

---

## 🔧 Common Setup

### Google Cloud Console Setup (Required for Both)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create/Select Project**
   - Click "Select a project" → "New Project"
   - Enter project name and click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - If prompted, configure consent screen first
   - Application type: "Web application"
   - Name: Your app name
   
5. **Add Authorized Redirect URIs**
   ```
   Development:
   http://localhost:3000/auth/google/callback
   
   Production:
   https://yourdomain.com/auth/google/callback
   ```

6. **Copy Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret**
   - Add them to your `.env` file

### Environment Variables Template

```env
# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Session
SESSION_SECRET=your-random-secret-key-change-in-production

# App
PORT=3000
NODE_ENV=development
```

### Security Best Practices

1. **Never commit `.env` file**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use HTTPS in Production**
   ```typescript
   cookie: {
     secure: process.env.NODE_ENV === 'production', // HTTPS only
     httpOnly: true,
     sameSite: 'strict',
   }
   ```

3. **Validate Redirect URIs**
   - Only allow whitelisted redirect URIs
   - Match exactly with Google Cloud Console

4. **Store Tokens Securely**
   - Use encrypted sessions
   - Don't expose tokens in client-side code
   - Use httpOnly cookies

5. **Handle Token Refresh**
   ```typescript
   async refreshToken(refreshToken: string) {
     const newTokens = await googleAuth.refreshAccessToken(refreshToken);
     // Update session with new tokens
     return newTokens;
   }
   ```

---

## 🎯 Testing Your Implementation

### Test URLs

1. **Home**: `http://localhost:3000/`
2. **Login**: `http://localhost:3000/auth/google`
3. **Profile**: `http://localhost:3000/profile` (requires auth)
4. **Logout**: `http://localhost:3000/logout`

### Expected Flow

1. User visits `/auth/google`
2. Redirects to Google login page
3. User logs in with Google
4. Google redirects to `/auth/google/callback?code=xxx`
5. Your app exchanges code for tokens
6. User profile is saved to session
7. User can access protected routes

---

## 📚 Additional Features

### Custom Scopes

```typescript
const googleAuth = new GoogleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
});
```

### Token Verification

```typescript
// Verify ID token
const payload = await googleAuth.verifyIdToken(idToken);
console.log('User ID:', payload.sub);
console.log('Email:', payload.email);
```

### Middleware-based Protection (Express)

```typescript
app.get('/api/protected', googleAuth.middleware(), (req, res) => {
  // This route is protected
  res.json({ user: (req as any).user });
});
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "redirect_uri_mismatch" error**
- Solution: Ensure redirect URI in `.env` matches Google Cloud Console exactly

**2. "invalid_client" error**
- Solution: Verify Client ID and Client Secret are correct

**3. Session not persisting**
- Solution: Check session middleware configuration and cookie settings

**4. TypeScript errors**
- Solution: Install type definitions:
  ```bash
  npm install --save-dev @types/express @types/express-session
  ```

---

## 📖 More Resources

- **Package Documentation**: [README.md](README.md)
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2
- **Express.js**: https://expressjs.com/
- **NestJS**: https://nestjs.com/

---

**Ready to integrate! 🚀**
