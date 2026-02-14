# 🚀 Deployment Checklist

## Step-by-Step Deployment Guide

### ✅ Step 1: Get Your Supabase Service Role Key

1. Go to: https://supabase.com/dashboard/project/nanyeperznosnxqbawvf/settings/api
2. Under "Project API keys", find **service_role** key (⚠️ Secret!)
3. Click "Copy" or "Reveal" and copy the key
4. It should start with: `eyJhbGc...`

**IMPORTANT**: Keep this key secure! Don't share it publicly.

---

### ✅ Step 2: Add Environment Variable to Vercel

**Method A: Via Vercel Dashboard (Recommended)**

1. Go to: https://vercel.com/dashboard
2. Find your project: `my-stock-daily-reminder`
3. Click on the project
4. Go to **Settings** → **Environment Variables**
5. Add new variable:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (paste the key from Step 1)
   - **Environments**: Check all (Production, Preview, Development)
6. Click **Save**

**Method B: Via Vercel CLI**

```bash
# If you have Vercel CLI installed
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste the key when prompted
# Select: Production, Preview, Development
```

---

### ✅ Step 3: Verify All Environment Variables Are Set

Check that these 3 variables exist in Vercel:

```
✅ SUPABASE_URL = https://nanyeperznosnxqbawvf.supabase.co
✅ SUPABASE_ANON_KEY = eyJhbGc... (starts with eyJ)
✅ SUPABASE_SERVICE_ROLE_KEY = eyJhbGc... (different from anon key)
```

---

### ✅ Step 4: Export and Deploy Updated Code

**Option A: Download from Figma Make and Deploy**

1. In Figma Make, click **Export** or **Download**
2. Extract the ZIP file
3. Navigate to the folder:
   ```bash
   cd my-stock-daily-reminder
   ```
4. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

**Option B: Push to GitHub (Auto-deploys to Vercel)**

1. Add all files:
   ```bash
   git add .
   git commit -m "Fix: Implement real Supabase authentication with database storage"
   git push origin main
   ```
2. Vercel automatically detects the push and deploys
3. Check deployment status in Vercel Dashboard

---

### ✅ Step 5: Wait for Deployment to Complete

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Check the **Deployments** tab
4. Wait for status to show: **✅ Ready**
5. You should see the deployment URL: `my-stock-daily-reminder.vercel.app`

---

### ✅ Step 6: Test the Deployed App

#### Test 1: Access the App
1. Go to: https://my-stock-daily-reminder.vercel.app
2. **Expected**: Login page loads (no 404 error)

#### Test 2: Create an Account
1. Click "没有账户？注册"
2. Enter:
   - Email: `test@example.com`
   - Password: `test123` (min 6 chars)
   - Confirm Password: `test123`
3. Click "注册"
4. **Expected**: 
   - ✅ Green success message: "注册成功！正在登录..."
   - ✅ Auto-redirects to Holdings page after 1 second

#### Test 3: Verify User in Supabase
1. Go to: https://supabase.com/dashboard/project/nanyeperznosnxqbawvf/auth/users
2. **Expected**: 
   - ✅ See user `test@example.com`
   - ✅ Status: Confirmed
   - ✅ Has a UUID (e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

#### Test 4: Add a Stock and Transaction
1. In the app, click "+" button
2. Enter stock code: `600519`
3. Add a transaction:
   - Type: Buy
   - Quantity: 100
   - Price: 1800
   - Date: Today
4. Click "确认"
5. **Expected**: Transaction appears in Holdings

#### Test 5: Verify Database Record
1. Go to: https://supabase.com/dashboard/project/nanyeperznosnxqbawvf/editor
2. Find table: `kv_store_08a91c5a`
3. Click to open
4. **Expected**: See a row like:
   ```
   key: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:transaction:1234567890_600519
   value: {"stockCode":"600519","stockName":"贵州茅台",...}
   ```

#### Test 6: Test Persistence
1. Click Settings (bottom right)
2. Click "退出登录"
3. **Expected**: Returns to login page
4. Log in again with same credentials
5. **Expected**: 
   - ✅ Successfully logs in
   - ✅ All transactions still visible
   - ✅ Data persists!

---

### ✅ Step 7: Test from Different Device

1. Open on your phone or another computer
2. Go to: https://my-stock-daily-reminder.vercel.app
3. Log in with same account
4. **Expected**: 
   - ✅ Same data appears
   - ✅ Synced across devices!

---

## 🐛 Troubleshooting

### Problem: 404 Error on Vercel

**Symptoms**: Blank page or "404 - Not Found"

**Solution**:
1. Check that these files exist in your deployment:
   - `/index.html`
   - `/src/main.tsx`
   - `/vercel.json`
2. Re-export from Figma Make
3. Deploy again

---

### Problem: "Failed to create user"

**Symptoms**: Error message when signing up

**Solution**:
1. Check Vercel environment variables
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
3. Verify the key is correct (copy from Supabase Dashboard)
4. Redeploy after adding the key:
   ```bash
   vercel --prod --force
   ```

---

### Problem: "Invalid login credentials"

**Symptoms**: Can't log in after signing up

**Solution**:
1. Make sure you signed up first
2. Check password is correct (min 6 characters)
3. Try resetting password or use different email

---

### Problem: Transactions Not Saving

**Symptoms**: Transactions disappear after refresh

**Solution**:
1. Check browser console for errors (F12)
2. Verify user is logged in (check localStorage has `userId`)
3. Check Supabase database connection
4. Clear browser cache and try again

---

### Problem: CORS Errors

**Symptoms**: "CORS policy blocked" in console

**Solution**:
1. Check server endpoint in `/supabase/functions/server/index.tsx`
2. Verify CORS is enabled for `"*"` origin
3. Redeploy the Edge Function

---

## 📞 Support Resources

- **Supabase Dashboard**: https://supabase.com/dashboard/project/nanyeperznosnxqbawvf
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## ✅ Success Criteria

Your deployment is successful when:

- [x] App loads at https://my-stock-daily-reminder.vercel.app
- [x] Can create new account (sign up)
- [x] User appears in Supabase Auth dashboard
- [x] Can log in with created account
- [x] Can add stocks and transactions
- [x] Data persists after logout and login
- [x] Transactions appear in `kv_store_08a91c5a` table
- [x] Works on different devices with same account

---

## 🎉 You're Done!

Once all checks pass, your app is **live and fully functional** with:

✅ Real user authentication  
✅ Database storage  
✅ Data persistence  
✅ Multi-device sync  
✅ Production-ready deployment  

**Share your app**: https://my-stock-daily-reminder.vercel.app 🚀

