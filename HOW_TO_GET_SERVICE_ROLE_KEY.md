# How to Get Your Supabase Service Role Key

## 📍 Location

**Direct Link:**
https://supabase.com/dashboard/project/nanyeperznosnxqbawvf/settings/api

## 🗺️ Navigation Path

```
Supabase Dashboard
  └── Settings (⚙️ icon in left sidebar)
      └── API
          └── Project API keys
              └── service_role (secret) ← This one!
```

## 📸 Visual Guide

### Step 1: Find Settings in Left Sidebar
Look for the **Settings** section (gear icon ⚙️) at the bottom of the left sidebar:

```
Left Sidebar:
  - Database
  - Authentication
  - Storage
  - Edge Functions
  - ...
  ▼ Settings          ← Click here
    - General
    - API             ← Then click here
    - Auth
    - ...
```

### Step 2: Locate "Project API keys" Section

On the Settings → API page, scroll down to find:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project API keys
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────┐
│ anon                              public│
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...  │
│ This key is safe to use in a browser... │
│                              [👁️ Reveal] │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ service_role                      secret│  ← YOU NEED THIS ONE
│ ey...                                    │
│ This key has the ability to bypass...   │
│                              [👁️ Reveal] │  ← Click "Reveal" or the copy icon
└─────────────────────────────────────────┘
```

### Step 3: Copy the service_role Key

1. Click the **"Reveal"** button (eye icon 👁️) or the **copy icon** 📋
2. The key will be revealed - it starts with `eyJhbGc...`
3. Copy the ENTIRE key
4. **Keep it secret!** ⚠️ Don't share publicly

## ⚠️ Security Warning

```
┌──────────────────────────────────────────────┐
│  ⚠️  WARNING: Keep This Key Secret!          │
├──────────────────────────────────────────────┤
│                                              │
│  The service_role key has ADMIN privileges   │
│  and can bypass Row Level Security (RLS).    │
│                                              │
│  ✅ DO: Store in Vercel environment vars     │
│  ✅ DO: Use only in backend/server code      │
│  ❌ DON'T: Commit to GitHub                  │
│  ❌ DON'T: Share in public forums            │
│  ❌ DON'T: Use in frontend code              │
│                                              │
└──────────────────────────────────────────────┘
```

## 📋 What the Key Looks Like

```
Format: JWT token starting with "eyJ"

Example (fake):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbnllcGVyem5vc254cWJhd3ZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYzOTUxMjAwMCwiZXhwIjoxOTU1MDg4MDAwfQ.abc123...

Length: ~200-300 characters
```

## 🔄 After You Get the Key

### Next Step: Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Find project: **my-stock-daily-reminder**
3. Go to: **Settings** → **Environment Variables**
4. Click: **Add New**
5. Enter:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (paste the key you just copied)
   - **Environments**: Check all (Production, Preview, Development)
6. Click: **Save**

### Then: Redeploy

```bash
# Option A: Automatic (if connected to GitHub)
git push origin main

# Option B: Manual via CLI
vercel --prod --force

# Option C: Via Vercel Dashboard
Go to Deployments → Click "..." → Redeploy
```

## ✅ Verification

After adding the key and redeploying:

1. Go to your app: https://my-stock-daily-reminder.vercel.app
2. Try signing up with a new account
3. If successful, check Supabase Auth dashboard:
   - https://supabase.com/dashboard/project/nanyeperznosnxqbawvf/auth/users
4. You should see the new user there! ✅

## 🐛 Troubleshooting

### "I can't find the Settings section"

**Solution**: Scroll down in the left sidebar. Settings is near the bottom, below all the other sections.

### "I only see anon key, not service_role key"

**Solution**: Make sure you're on the **Settings → API** page, not **Integrations → Data API**. The correct URL should be:
`/settings/api` (not `/integrations/data_api`)

### "The key is hidden with dots"

**Solution**: Click the **"Reveal"** button (eye icon) or the copy icon to reveal/copy the full key.

### "I accidentally exposed my key"

**Solution**: 
1. Go to Settings → API
2. Click "Reset" next to the service_role key
3. A new key will be generated
4. Update the key in Vercel
5. Redeploy

## 📞 Quick Reference

**Direct Link to API Settings:**
https://supabase.com/dashboard/project/nanyeperznosnxqbawvf/settings/api

**What to look for:**
- Section: "Project API keys"
- Key name: "service_role"
- Label: "secret" (not "public")
- Starts with: "eyJhbGc..."

**Where to use it:**
- Vercel Environment Variables ONLY
- Backend/Server code ONLY
- NEVER in frontend code
- NEVER commit to Git

---

## 🎯 Summary

1. ✅ Go to: **Settings → API** (in left sidebar)
2. ✅ Find: **"Project API keys"** section
3. ✅ Look for: **service_role** (marked as "secret")
4. ✅ Click: **Reveal** or **Copy** button
5. ✅ Paste into: **Vercel Environment Variables**
6. ✅ Redeploy your app

You're looking for a ~250 character string that starts with `eyJhbGc...`! 🔑
