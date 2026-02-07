# 🚀 Quick Start - NPM Package Publish করুন

## ⚡ সংক্ষিপ্ত Process (5 Minutes)

### 1️⃣ GitHub Setup (প্রথমবার শুধু)

```bash
# GitHub এ নতুন repository তৈরি করুন (google-auth)
# তারপর:

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/google-auth.git
git push -u origin main
```

### 2️⃣ NPM Login (প্রথমবার শুধু)

```bash
npm login
# Username, Password, Email দিন
```

### 3️⃣ Publish করুন

**Important:** যদি আপনার NPM account এ 2FA enabled থাকে, তাহলে OTP code লাগবে!

**Option A: Automated Script (সহজ)** ⭐ Recommended

Windows:
```bash
publish.bat
```

Linux/Mac:
```bash
chmod +x publish.sh
./publish.sh
```

**Option B: Manual Commands**

```bash
# Build করুন
npm run build

# Version বাড়ান (একটা choose করুন)
npm version patch    # 1.0.0 → 1.0.1 (bug fixes)
npm version minor    # 1.0.0 → 1.1.0 (new features)
npm version major    # 1.0.0 → 2.0.0 (breaking changes)

# Publish করুন
npm publish --access public

# GitHub এ push করুন
git push origin main --tags
```

## ✅ সম্পন্ন! 

আপনার package এখন live:
```
https://www.npmjs.com/package/@chamonali/google-auth
```

## 📦 অন্যরা কিভাবে Install করবে

```bash
npm install @chamonali/google-auth
```

## 📖 বিস্তারিত Guide

দেখুন: [PUBLISHING_GUIDE.md](PUBLISHING_GUIDE.md)

---

## 🔄 Update Process

Code পরিবর্তন করার পর:

```bash
npm version patch    # Version বাড়ান
git push --tags      # GitHub এ push করুন
npm publish          # NPM এ publish করুন
```

## 🎯 Checklist

- [ ] GitHub এ repository তৈরি
- [ ] NPM এ login
- [ ] Package build ঠিক আছে (`npm run build`)
- [ ] Version number ঠিক আছে
- [ ] `npm publish --access public` run করেছেন
- [ ] GitHub এ push করেছেন

**🎊 Done! Package published!**

---

## ⚠️ 2FA Error পেলে?

যদি এই error আসে:
```
403 Forbidden - Two-factor authentication required
```

**Solution: OTP সহ publish করুন**

```bash
# Authenticator app থেকে code নিন, তারপর:
npm publish --access public --otp=123456
```

*(123456 এর জায়গায় আপনার real-time 6-digit code দিন)*

**বিস্তারিত guide:** দেখুন [2FA_PUBLISH_GUIDE.md](2FA_PUBLISH_GUIDE.md)
