# 🚀 NPM Package Publishing এবং Use করার সম্পূর্ণ গাইড

## 📋 সম্পূর্ণ Process Overview

```
1. GitHub এ Repository তৈরি
2. Code GitHub এ Push করা
3. NPM Account তৈরি/Login
4. Package NPM এ Publish করা
5. অন্যরা Install করে Use করবে
```

---

## ✅ Step 1: GitHub Repository তৈরি করুন

### 1.1 GitHub এ যান এবং নতুন Repository তৈরি করুন

1. [GitHub.com](https://github.com) এ login করুন
2. উপরে ডান দিকে **"+"** icon > **"New repository"** ক্লিক করুন
3. Repository setup:
   - **Repository name:** `google-auth` (অথবা যেকোনো নাম)
   - **Description:** "Easy-to-use Google OAuth authentication package for Node.js"
   - **Public** সিলেক্ট করুন (যাতে সবাই দেখতে পারে)
   - ❌ **"Add README"** চেক করবেন না (আমরা ইতিমধ্যে README তৈরি করেছি)
   - ❌ **".gitignore"** এবং **"license"** ও চেক করবেন না
4. **"Create repository"** ক্লিক করুন

### 1.2 Local Repository Initialize এবং GitHub এ Push করুন

আপনার project folder এ Terminal/CMD খুলুন এবং এই commands run করুন:

```bash
cd c:\chamonali\npm

# Git initialize করুন (যদি আগে না করে থাকেন)
git init

# সব files stage করুন
git add .

# First commit করুন
git commit -m "Initial commit: Google Auth npm package"

# GitHub repository এর সাথে connect করুন
# (এখানে 'chamonali' এর জায়গায় আপনার GitHub username দিন)
git remote add origin https://github.com/chamonali/google-auth.git

# GitHub এ push করুন
git branch -M main
git push -u origin main
```

**✅ এখন আপনার code GitHub এ upload হয়ে গেছে!**

---

## 🔑 Step 2: NPM Account তৈরি করুন

### 2.1 NPM এ Sign Up করুন (যদি account না থাকে)

1. [npmjs.com/signup](https://www.npmjs.com/signup) এ যান
2. Account তৈরি করুন:
   - Username
   - Email address
   - Password
3. Email verify করুন (inbox check করুন)

### 2.2 Terminal এ NPM Login করুন

```bash
npm login
```

আপনার credentials দিন:
- **Username:** আপনার npm username
- **Password:** আপনার password
- **Email:** আপনার email

**✅ Successfully logged in দেখালে ready!**

---

## 📦 Step 3: Package Publish করুন

### 3.1 Final Check করুন

```bash
# Package build করুন (নিশ্চিত করতে)
npm run build

# Package test করুন
npm pack --dry-run
```

এটি দেখাবে কি কি files publish হবে।

### 3.2 NPM এ Publish করুন

```bash
npm publish --access public
```

**🎉 Congratulations! আপনার package এখন NPM এ live!**

আপনার package এখানে পাওয়া যাবে:
```
https://www.npmjs.com/package/@chamonali/google-auth
```

---

## 💻 Step 4: অন্যরা কিভাবে Use করবে

### 4.1 Installation

যেকোনো Node.js project এ:

```bash
npm install @chamonali/google-auth
```

অথবা

```bash
yarn add @chamonali/google-auth
```

### 4.2 Basic Usage Example

#### JavaScript (CommonJS):

```javascript
const { GoogleAuth } = require('@chamonali/google-auth');
const express = require('express');

const app = express();

// Google Auth setup
const googleAuth = new GoogleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/auth/google/callback'
});

// Login route
app.get('/auth/google', (req, res) => {
  const authUrl = googleAuth.getAuthUrl();
  res.redirect(authUrl);
});

// Callback route
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const tokens = await googleAuth.getTokens(code);
  const user = await googleAuth.getUserProfile(tokens.access_token);
  
  res.json({ user });
});

app.listen(3000);
```

#### TypeScript (ES Modules):

```typescript
import { GoogleAuth } from '@chamonali/google-auth';
import express from 'express';

const app = express();

const googleAuth = new GoogleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: 'http://localhost:3000/auth/google/callback'
});

app.get('/auth/google', (req, res) => {
  res.redirect(googleAuth.getAuthUrl());
});

app.get('/auth/google/callback', async (req, res) => {
  const tokens = await googleAuth.getTokens(req.query.code as string);
  const user = await googleAuth.getUserProfile(tokens.access_token!);
  res.json({ user });
});

app.listen(3000);
```

### 4.3 User দের Setup Steps

1. **Install করুন:**
   ```bash
   npm install @chamonali/google-auth
   ```

2. **Google Cloud Console এ credentials নিন:**
   - [console.cloud.google.com](https://console.cloud.google.com)
   - OAuth 2.0 Client ID তৈরি করুন
   - Client ID এবং Client Secret copy করুন

3. **Environment variables set করুন:**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   ```

4. **Code এ use করুন** (উপরের examples অনুযায়ী)

---

## 🔄 Package Update করার Process

যখন code এ পরিবর্তন করবেন:

### 1. Code Update করুন

```bash
# Code change করুন
# Tests run করুন (if any)
```

### 2. Version Number বাড়ান

```bash
# Patch update (1.0.0 → 1.0.1) - bug fixes
npm version patch

# Minor update (1.0.0 → 1.1.0) - new features
npm version minor

# Major update (1.0.0 → 2.0.0) - breaking changes
npm version major
```

### 3. GitHub এ Push করুন

```bash
git push origin main
git push origin --tags
```

### 4. NPM এ Publish করুন

```bash
npm publish
```

---

## 📊 Package Statistics দেখুন

### NPM Stats:

- Package page: `https://www.npmjs.com/package/@chamonali/google-auth`
- Weekly downloads দেখতে পারবেন
- Version history দেখতে পারবেন

### GitHub Stats:

- Stars ⭐
- Forks 🍴
- Issues 🐛
- Pull Requests 🔀

---

## 🎯 Marketing এবং Visibility বাড়ানো

### 1. README.md ভালো করে লিখুন ✅ (আমরা করেছি)

### 2. GitHub Topics যোগ করুন:
- Repository Settings > Topics
- যোগ করুন: `google-auth`, `oauth2`, `authentication`, `nodejs`, `typescript`

### 3. Keywords ভালো করুন ✅ (package.json এ আছে)

### 4. Share করুন:
- Dev.to এ article লিখুন
- Reddit (r/node, r/javascript) এ post করুন
- Twitter তে share করুন
- LinkedIn এ post করুন

### 5. Examples এবং Documentation:
- ✅ Examples folder আছে
- ✅ README detailed আছে
- GitHub Wiki তৈরি করতে পারেন

---

## 🛡️ Best Practices

### Security:

```bash
# Regular security audit
npm audit

# Fix vulnerabilities
npm audit fix
```

### Testing (Future):

```bash
# Testing framework add করুন
npm install --save-dev jest @types/jest

# tests/ folder তৈরি করুন
```

### CI/CD Setup করুন:

GitHub Actions এ automated testing এবং publishing setup করুন।

---

## 📝 Complete Command Summary

```bash
# ===== Initial Setup =====
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/google-auth.git
git push -u origin main

# ===== NPM Publishing =====
npm login
npm run build
npm publish --access public

# ===== Updates =====
# Make changes...
npm version patch
git push origin main --tags
npm publish

# ===== Users Install =====
npm install @chamonali/google-auth
```

---

## 🌍 Real World Usage Example

একজন developer আপনার package কিভাবে use করবে:

```bash
# New project তৈরি
mkdir my-google-auth-app
cd my-google-auth-app
npm init -y

# আপনার package install
npm install @chamonali/google-auth express dotenv

# .env file তৈরি
echo "GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/callback" > .env

# app.js তৈরি করবে
# Code লিখবে (উপরের examples থেকে)

# Run করবে
node app.js
```

---

## 🎉 Final Checklist

✅ GitHub repository তৈরি হয়েছে  
✅ Code GitHub এ push করা হয়েছে  
✅ NPM account তৈরি হয়েছে  
✅ Package NPM এ publish করা হয়েছে  
✅ README documentation complete  
✅ Examples দেওয়া আছে  
✅ TypeScript support আছে  
✅ No build errors  

---

## 🔗 Important Links

- **NPM Package:** https://www.npmjs.com/package/@chamonali/google-auth
- **GitHub Repo:** https://github.com/chamonali/google-auth
- **NPM Profile:** https://www.npmjs.com/~chamonali
- **Documentation:** GitHub repository এর README.md

---

## 💡 Pro Tips

1. **Semantic Versioning Follow করুন:**
   - MAJOR.MINOR.PATCH (1.0.0)
   - Bug fixes → Patch (1.0.1)
   - New features → Minor (1.1.0)
   - Breaking changes → Major (2.0.0)

2. **CHANGELOG.md Update রাখুন** ✅ (আছে)

3. **Regular Maintenance:**
   - Dependencies update করুন
   - Security issues fix করুন
   - Issues এবং PRs respond করুন

4. **Community Building:**
   - Issues তে help করুন
   - Feature requests consider করুন
   - Contributors welcome করুন

---

**🎊 আপনার package এখন production-ready এবং সবার জন্য available!**

যে কেউ এখন শুধু `npm install @chamonali/google-auth` করে আপনার package use করতে পারবে! 🚀
