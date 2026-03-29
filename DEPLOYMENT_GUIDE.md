# DESK Helpdesk — Complete Deployment Guide
## Stack: MongoDB Atlas → Railway (backend) → Vercel (frontend)
### All free tiers. Live in ~20 minutes.

---

## OVERVIEW

```
Browser ──→ Vercel (React frontend)
                    ↕ API calls
              Railway (Node.js backend)
                    ↕ Database
            MongoDB Atlas (cloud database)
```

---

## STEP 1 — Push to GitHub (5 minutes)

### 1.1 Create a GitHub account (if you don't have one)
Go to: https://github.com/signup

### 1.2 Create a new repository
1. Go to: https://github.com/new
2. Repository name: `desk-helpdesk`
3. Set to **Public** (free deployments need public repos on free tiers)
4. Do NOT check "Add README" — leave everything unchecked
5. Click **Create repository**

### 1.3 Push your code
Open your terminal, go to your helpdesk folder, and run:

```bash
cd helpdesk

git init
git add .
git commit -m "Initial commit: DESK IT Helpdesk System"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/desk-helpdesk.git
git push -u origin main
```

> Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

✅ **Check:** Go to `https://github.com/YOUR_USERNAME/desk-helpdesk` — you should see all your files.

---

## STEP 2 — MongoDB Atlas (database) — 5 minutes

### 2.1 Create account
Go to: https://www.mongodb.com/cloud/atlas/register
Sign up free (use Google to speed it up)

### 2.2 Create a free cluster
1. Click **Build a Database**
2. Choose **M0 (Free)**
3. Provider: **AWS**, Region: closest to you
4. Cluster name: `desk-cluster`
5. Click **Create**

### 2.3 Create database user
When prompted:
1. Username: `deskadmin`
2. Password: click **Autogenerate Secure Password** → **COPY AND SAVE IT**
3. Click **Create User**

### 2.4 Allow network access
1. Click **Add My Current IP Address** → also add `0.0.0.0/0` (allow all — Railway needs this)
2. Click **Finish and Close**

### 2.5 Get your connection string
1. Click **Connect** on your cluster
2. Click **Drivers**
3. Select **Node.js** version 5.5 or later
4. Copy the connection string — it looks like:
   ```
   mongodb+srv://deskadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the password you copied in step 2.3
6. Add the database name before the `?`:
   ```
   mongodb+srv://deskadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/helpdesk_db?retryWrites=true&w=majority
   ```

✅ **Save this string** — you need it in Step 3.

---

## STEP 3 — Railway (backend) — 5 minutes

### 3.1 Create account
Go to: https://railway.app
Click **Login with GitHub** — authorize Railway

### 3.2 Deploy backend
1. Click **New Project**
2. Click **Deploy from GitHub repo**
3. Select your `desk-helpdesk` repository
4. Railway will detect it. Click **Add service** → **GitHub repo**
5. Set the **Root Directory** to `backend`
6. Click **Deploy**

### 3.3 Set Environment Variables
Click your service → **Variables** tab → **Add Variable** one by one:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your MongoDB Atlas string from Step 2.5 |
| `JWT_SECRET` | `261959ad2756c0dc465d4a705f8f109790375b4aea4834e1a1a00e6b128f1400e9ea3fa6f2dd91f85161cb81708d2ad08b57c4da2e8e3ca3c2f2d36d4cea89f1` |
| `JWT_EXPIRE` | `7d` |
| `MAX_FILE_SIZE` | `10485760` |
| `UPLOAD_PATH` | `./uploads` |
| `CLIENT_URL` | *(leave blank for now — fill in after Step 4)* |

### 3.4 Get your backend URL
1. Click **Settings** tab
2. Under **Domains** click **Generate Domain**
3. You'll get something like: `desk-helpdesk-production.up.railway.app`
4. **SAVE THIS URL**

### 3.5 Verify backend is live
Open your browser and go to:
```
https://YOUR-RAILWAY-URL.up.railway.app/api/health
```
You should see:
```json
{ "success": true, "message": "DESK API is running" }
```

✅ **Backend is live!**

---

## STEP 4 — Seed the database

Open: `https://YOUR-RAILWAY-URL.up.railway.app/api/health` — if it's working, seed via Railway CLI or manually.

### Option A — Quick seed via Railway CLI (recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
cd helpdesk/backend
railway link

# Run seeder
railway run node utils/seeder.js
```

### Option B — Run seeder locally pointing to Atlas
```bash
cd helpdesk/backend
# Temporarily set your Atlas MONGO_URI
MONGO_URI="mongodb+srv://deskadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/helpdesk_db?retryWrites=true&w=majority" node utils/seeder.js
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🌱 Starting database seed...
✅ Cleared existing data
✅ Created 7 users
✅ Created 8 tickets with comments and audit logs
🎉 Database seeded successfully!
```

---

## STEP 5 — Vercel (frontend) — 5 minutes

### 5.1 Create account
Go to: https://vercel.com
Click **Sign up with GitHub** — authorize Vercel

### 5.2 Import your project
1. Click **Add New** → **Project**
2. Find `desk-helpdesk` in the list → click **Import**
3. Set **Root Directory** to `frontend`
4. Framework Preset will auto-detect as **Create React App**

### 5.3 Set Environment Variables
Before clicking Deploy, scroll to **Environment Variables** and add:

| Variable | Value |
|---|---|
| `REACT_APP_API_URL` | `https://YOUR-RAILWAY-URL.up.railway.app/api` |
| `REACT_APP_NAME` | `DESK IT Helpdesk` |

### 5.4 Deploy!
Click **Deploy** — Vercel will build and deploy (takes ~2 minutes)

You'll get a URL like: `https://desk-helpdesk.vercel.app`

### 5.5 Update backend CORS with frontend URL
Go back to Railway → your backend service → **Variables** tab:
- Update `CLIENT_URL` = `https://desk-helpdesk.vercel.app`
- Update `FRONTEND_URL` = `https://desk-helpdesk.vercel.app`

Railway will auto-redeploy.

---

## STEP 6 — Verify everything works

Open your Vercel URL. You should see the DESK login page.

Test with demo accounts:
| Role | Email | Password |
|---|---|---|
| Employee | sarah@company.com | password123 |
| IT Technician | alex@company.com | password123 |
| Admin | david@company.com | password123 |

### Full feature checklist:
- [ ] Login works for all 3 roles
- [ ] Employee can submit a ticket
- [ ] Technician can see all tickets and update status
- [ ] Admin can see Users and Audit Trail
- [ ] File attachments upload and download
- [ ] Notifications appear in bell icon
- [ ] Reports page shows charts

---

## TROUBLESHOOTING

### "CORS error" in browser console
→ Make sure `CLIENT_URL` in Railway exactly matches your Vercel URL (including https://, no trailing slash)

### "Cannot connect to MongoDB"
→ In MongoDB Atlas, go to Network Access → add `0.0.0.0/0` to allow Railway's IP

### "Application error" on Vercel
→ Check that `REACT_APP_API_URL` ends with `/api` (e.g. `https://xxx.railway.app/api`)

### Backend crashes on Railway
→ Railway → your service → **Logs** tab — check the error message

### Tickets not loading
→ Open browser DevTools → Network tab → look for failed API calls → check the URL is correct

---

## CUSTOM DOMAIN (optional, free on Vercel)

1. Vercel → your project → **Settings** → **Domains**
2. Add your domain (e.g. `helpdesk.yourcompany.com`)
3. Add the CNAME record shown to your DNS provider
4. Update `CLIENT_URL` on Railway to match your custom domain

---

## ENVIRONMENT VARIABLES SUMMARY

### Railway (backend):
```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=261959ad2756c0dc465...  (use the one above)
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CLIENT_URL=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

### Vercel (frontend):
```
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_NAME=DESK IT Helpdesk
```

---

## ESTIMATED COSTS

| Service | Free Tier Limits | Enough for |
|---|---|---|
| MongoDB Atlas M0 | 512MB storage, shared | ~50,000 tickets |
| Railway Starter | $5 free credit/month | ~500 hours/month |
| Vercel Hobby | Unlimited deploys | Any traffic |

**Total cost for small-medium company: $0/month**

