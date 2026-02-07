# 🔐 NPM Publishing with 2FA - সমস্যা সমাধান

## ❌ Error যা আপনি পেয়েছেন:

```
403 Forbidden - Two-factor authentication or granular access token 
with bypass 2fa enabled is required to publish packages.
```

## ✅ সমাধান (3টি উপায়)

---

## 🎯 Method 1: OTP দিয়ে Publish (সবচেয়ে সহজ) ⭐

### Step 1: Fresh Login করুন

```bash
npm logout
npm login
```

প্রম্পট এ দিন:
- Username
- Password  
- Email
- **OTP Code** (আপনার authenticator app থেকে)

### Step 2: Publish করুন

**Option A: Directly with OTP**

```bash
npm publish --access public --otp=123456
```

*(123456 এর জায়গায় real-time OTP code দিন)*

**Option B: Interactive (প্রম্পট করবে)**

```bash
npm publish --access public
```

এটি আপনাকে OTP জিজ্ঞেস করবে - তখন code দিন।

---

## 🔑 Method 2: Automation Token (Script এর জন্য)

### Step 1: NPM Website এ Token তৈরি করুন

1. [npmjs.com](https://www.npmjs.com) এ login করুন
2. উপরে ডানে আপনার profile picture ক্লিক করুন
3. **"Access Tokens"** এ যান
4. **"Generate New Token"** button ক্লিক করুন
5. Token type select করুন:
   - ✅ **"Automation"** - 2FA bypass করবে, CI/CD এর জন্য
   - অথবা **"Publish"** - প্রতিবার OTP লাগবে

6. Token copy করুন (এটি আবার দেখতে পারবেন না!)

### Step 2: Token Use করুন

**Option A: .npmrc file এ (Local)**

```bash
# Project folder এ .npmrc তৈরি করুন
echo "//registry.npmjs.org/:_authToken=npm_YOUR_TOKEN_HERE" > .npmrc
```

**⚠️ Warning:** `.gitignore` এ `.npmrc` যোগ করুন!

```bash
echo ".npmrc" >> .gitignore
```

**Option B: Environment Variable (Better)**

Windows (CMD):
```bash
set NPM_TOKEN=npm_YOUR_TOKEN_HERE
npm publish --access public
```

Windows (PowerShell):
```powershell
$env:NPM_TOKEN="npm_YOUR_TOKEN_HERE"
npm publish --access public
```

Linux/Mac:
```bash
export NPM_TOKEN=npm_YOUR_TOKEN_HERE
npm publish --access public
```

### Step 3: Publish করুন

```bash
npm publish --access public
```

এখন 2FA prompt করবে না! ✅

---

## 🛠️ Method 3: 2FA Temporarily Disable (Not Recommended)

**⚠️ Security risk! শুধু test এর জন্য।**

1. [npmjs.com](https://www.npmjs.com) এ login
2. Settings > Two-Factor Authentication
3. Disable করুন
4. Publish করুন
5. **অবশ্যই আবার Enable করুন!**

---

## 📋 Complete Publishing Steps (2FA সহ)

### Quick Publish:

```bash
# 1. Build করুন
npm run build

# 2. Version বাড়ান (যদি প্রয়োজন হয়)
npm version patch

# 3. Authenticator app খুলুন এবং OTP code নিন

# 4. Publish করুন with OTP
npm publish --access public --otp=YOUR_6_DIGIT_CODE

# 5. GitHub এ push করুন
git push origin main --tags
```

### Full Example:

```bash
ASUS@DESKTOP-8935J2P MINGW64 /c/chamonali/npm (main)
$ npm logout
Successfully logged out

$ npm login
Username: chamonali
Password: ********
Email: your@email.com
Enter one-time password: 123456
Logged in successfully!

$ npm publish --access public --otp=654321
Published @chamonali/google-auth@1.1.0 ✅

$ git push origin main --tags
Pushed to GitHub ✅
```

---

## 🔧 Troubleshooting

### Error: "OTP code has already been used"

- Wait 30 seconds এবং নতুন code নিন
- Authenticator app এর time sync check করুন

### Error: "Invalid OTP"

- Code correctly টাইপ করেছেন কিনা check করুন
- Code expire হয়নি তো? (30 second validity)
- Authenticator app এর clock sync করুন

### Error: "Token expired"

```bash
npm logout
npm login  # Fresh login
```

### Error: "E403 Forbidden"

- আপনার account এ publish permission আছে কিনা check করুন
- Package name already taken কিনা check করুন
- `--access public` flag দিয়েছেন কিনা verify করুন

---

## 🚀 Automated Publishing Script (with 2FA)

**Windows Batch File:** `publish-with-2fa.bat`

```batch
@echo off
echo Building package...
call npm run build

set /p OTP="Enter your 2FA code: "

echo Publishing with OTP...
call npm publish --access public --otp=%OTP%

if %errorlevel% equ 0 (
    echo Published successfully!
    
    set /p PUSH="Push to GitHub? [y/N]: "
    if /i "%PUSH%"=="y" (
        git push origin main --tags
        echo Pushed to GitHub!
    )
) else (
    echo Publish failed! Check the error above.
)

pause
```

**Linux/Mac Shell Script:** `publish-with-2fa.sh`

```bash
#!/bin/bash

echo "Building package..."
npm run build

read -p "Enter your 2FA code: " OTP

echo "Publishing with OTP..."
npm publish --access public --otp=$OTP

if [ $? -eq 0 ]; then
    echo "Published successfully!"
    
    read -p "Push to GitHub? [y/N]: " PUSH
    if [[ $PUSH =~ ^[Yy]$ ]]; then
        git push origin main --tags
        echo "Pushed to GitHub!"
    fi
else
    echo "Publish failed! Check the error above."
fi
```

Run করুন:

```bash
# Windows
publish-with-2fa.bat

# Linux/Mac
chmod +x publish-with-2fa.sh
./publish-with-2fa.sh
```

---

## 📱 Authenticator Apps

যদি Authenticator app না থাকে:

- **Google Authenticator** (Android/iOS)
- **Authy** (Android/iOS/Desktop) - Recommended
- **Microsoft Authenticator** (Android/iOS)
- **1Password** (Paid, but excellent)

---

## ✅ এখনই করুন:

1. ✅ Terminal এ run করুন:
   ```bash
   npm logout
   npm login
   ```

2. ✅ Authenticator app খুলুন

3. ✅ Publish করুন:
   ```bash
   npm publish --access public --otp=YOUR_CODE
   ```

4. ✅ Success message দেখুন! 🎉

---

**🎊 Package publish হয়ে গেলে:**

```
https://www.npmjs.com/package/@chamonali/google-auth
```

**যে কেউ এখন install করতে পারবে:**

```bash
npm install @chamonali/google-auth
```

**Done! 🚀**
