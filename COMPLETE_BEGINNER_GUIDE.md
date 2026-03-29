# DESK IT Helpdesk — Your Complete Guide
## "I know nothing" → Live on the Internet

---

# ═══════════════════════════════════════
# PART 1 — WHAT WAS BUILT FOR YOU
# ═══════════════════════════════════════

## What is this system?

This is a full IT Helpdesk web application — like what companies use so
employees can report computer problems and IT staff can fix them.

Think of it like a WhatsApp group, but organized. Instead of messages,
you submit "tickets" (like a complaint form). IT staff see them, assign
them, and mark them solved.

---

## Languages & Technologies Used

Think of it like building a house:
- The FOUNDATION is the database (where all data is saved)
- The WALLS are the backend (the rules and logic)
- The ROOF & WINDOWS are the frontend (what you see and click)

### 1. DATABASE — MongoDB
  What it does: Stores all data (users, tickets, comments, etc.)
  Language: JSON-like documents (no need to know this — it's automatic)
  Where it lives: MongoDB Atlas (free cloud service)

### 2. BACKEND — Node.js + Express.js
  What it does: The "brain" — handles logins, saves tickets, checks permissions
  Language: JavaScript (server-side)
  Files: 20 files, 1,604 lines of code

### 3. FRONTEND — React.js + Tailwind CSS
  What it does: The website you see and click
  Language: JavaScript (JSX) + CSS
  Files: 23 files, 3,746 lines of code

TOTAL: 43 files, 5,350 lines of code — all built for you ✓

---

## File Structure (the folder layout)

```
helpdesk/                          ← Your main project folder
│
├── DEPLOYMENT_GUIDE.md            ← Technical deployment notes
├── README.md                      ← Project overview
├── package.json                   ← Root config
├── setup.sh                       ← Helper script
│
├── backend/                       ← THE BRAIN (server-side code)
│   ├── server.js                  ← Main server file (starts everything)
│   │
│   ├── config/
│   │   └── database.js            ← Connects to MongoDB
│   │
│   ├── models/                    ← Database table definitions
│   │   ├── User.js                ← User accounts (name, email, password, role)
│   │   ├── Ticket.js              ← Support tickets
│   │   └── index.js               ← Comments, Notifications, Audit logs
│   │
│   ├── controllers/               ← Business logic (what happens when you click)
│   │   ├── authController.js      ← Login, register, forgot password
│   │   ├── ticketController.js    ← Create, update, delete tickets
│   │   └── otherControllers.js    ← Comments, users, notifications, audit
│   │
│   ├── routes/                    ← URL paths (like street addresses for data)
│   │   ├── auth.js                ← /api/auth/login, /api/auth/register
│   │   ├── tickets.js             ← /api/tickets
│   │   ├── comments.js            ← /api/comments
│   │   ├── users.js               ← /api/users
│   │   ├── notifications.js       ← /api/notifications
│   │   ├── audit.js               ← /api/audit
│   │   └── uploads.js             ← /api/upload (file attachments)
│   │
│   ├── middleware/                ← Security checks (runs before every request)
│   │   ├── auth.js                ← "Are you logged in? Are you allowed?"
│   │   ├── upload.js              ← File size and type checking
│   │   ├── errorHandler.js        ← Catches and formats errors nicely
│   │   └── notFound.js            ← Shows 404 when page doesn't exist
│   │
│   ├── utils/
│   │   └── seeder.js              ← Loads demo data (users + tickets)
│   │
│   ├── railway.json               ← Tells Railway.app how to run the server
│   ├── Procfile                   ← Backup start command for Railway
│   ├── .env.example               ← Template of secret settings
│   └── package.json               ← Lists all backend packages needed
│
└── frontend/                      ← THE FACE (what users see)
    ├── public/
    │   └── index.html             ← The single HTML page (React fills it)
    │
    ├── src/
    │   ├── App.jsx                ← Main router (which page shows for which URL)
    │   ├── index.js               ← Entry point (starts React)
    │   ├── index.css              ← Global styles
    │   │
    │   ├── api/
    │   │   └── index.js           ← All API calls to backend in one place
    │   │
    │   ├── context/               ← Global state (shared between all pages)
    │   │   ├── AuthContext.jsx    ← "Who is logged in?"
    │   │   └── NotificationContext.jsx ← Notification bell data
    │   │
    │   ├── hooks/
    │   │   └── useTickets.js      ← Reusable ticket-fetching logic
    │   │
    │   ├── utils/
    │   │   └── helpers.js         ← Small helper functions (dates, colors, etc.)
    │   │
    │   ├── components/            ← Reusable building blocks
    │   │   ├── common/
    │   │   │   ├── index.jsx      ← Buttons, Badges, Modals, Avatars, etc.
    │   │   │   ├── ErrorBoundary.jsx ← Catches crashes gracefully
    │   │   │   └── Skeletons.jsx  ← Loading placeholder animations
    │   │   │
    │   │   ├── layout/
    │   │   │   └── AppLayout.jsx  ← Sidebar + Topbar + Notification bell
    │   │   │
    │   │   ├── dashboard/
    │   │   │   ├── Dashboard.jsx  ← Home screen (different for each role)
    │   │   │   └── ReportsPage.jsx ← Charts and analytics
    │   │   │
    │   │   ├── tickets/
    │   │   │   ├── TicketsTable.jsx    ← The list of all tickets
    │   │   │   ├── TicketDetailModal.jsx ← Click a ticket → see everything
    │   │   │   └── NewTicketModal.jsx  ← Submit a new ticket form
    │   │   │
    │   │   └── admin/
    │   │       ├── AdminUsersPage.jsx  ← Manage all users (Admin only)
    │   │       └── AuditTrailPage.jsx  ← Who did what and when (Admin only)
    │   │
    │   └── pages/                 ← Full pages (linked to URLs)
    │       ├── AuthPages.jsx      ← Login + Register pages
    │       ├── ForgotPasswordPage.jsx ← Forgot/reset password
    │       ├── ProfilePage.jsx    ← My profile + change password
    │       └── NotFoundPage.jsx   ← 404 page
    │
    ├── tailwind.config.js         ← CSS framework config
    ├── postcss.config.js          ← CSS processing config
    ├── vercel.json                ← Tells Vercel.com how to deploy frontend
    └── package.json               ← Lists all frontend packages needed
```

---

## The 3 User Roles

EMPLOYEE (normal staff)
  ✓ Submit tickets
  ✓ See only their own tickets
  ✓ Add comments
  ✗ Cannot see other people's tickets
  ✗ Cannot change ticket status

IT TECHNICIAN (IT support staff)
  ✓ See ALL tickets
  ✓ Assign tickets to themselves or others
  ✓ Update status (Open → In Progress → Resolved)
  ✓ Add internal notes (hidden from employees)
  ✓ Add resolution notes
  ✓ See reports and analytics

ADMIN (IT manager)
  ✓ Everything a technician can do
  ✓ Create/edit/deactivate user accounts
  ✓ See full audit trail (who changed what and when)
  ✓ Delete tickets
  ✓ Full system overview

---

## Demo Accounts (already set up in seeder)

| Role       | Email                | Password    |
|------------|----------------------|-------------|
| Employee   | sarah@company.com    | password123 |
| Employee   | mike@company.com     | password123 |
| Technician | alex@company.com     | password123 |
| Technician | priya@company.com    | password123 |
| Admin      | david@company.com    | password123 |

---

# ═══════════════════════════════════════
# PART 2 — WHAT YOU NEED BEFORE YOU START
# ═══════════════════════════════════════

You need to install 2 things on your computer.
Both are FREE. Both have simple installers.

## REQUIRED: Node.js
  This is the engine that runs the backend code.
  Without this — nothing works.

  Download: https://nodejs.org
  → Click the big green button "LTS" (the stable version)
  → Run the installer, click Next → Next → Finish
  → That's it!

  CHECK IT WORKED: Open your terminal/command prompt and type:
    node --version
  You should see something like: v20.11.0

## REQUIRED: Git
  This is the tool that sends your code to GitHub.

  Download: https://git-scm.com/downloads
  → Choose your operating system
  → Run the installer, keep all default settings
  → Click Next until done

  CHECK IT WORKED: Open your terminal and type:
    git --version
  You should see something like: git version 2.43.0

## What is a terminal / command prompt?
  Windows: Press Windows key → type "cmd" → press Enter
           OR press Windows key → type "PowerShell" → press Enter
  Mac:     Press Cmd + Space → type "terminal" → press Enter
  Linux:   Press Ctrl + Alt + T

---

# ═══════════════════════════════════════
# PART 3 — GET THE PROJECT ON YOUR COMPUTER
# ═══════════════════════════════════════

## Step 3.1 — Download the zip file
  Download the file: helpdesk_deploy_ready.zip
  (You already have it from the previous messages in this chat)

## Step 3.2 — Extract it
  Windows: Right-click the zip → "Extract All" → choose a location like Desktop
  Mac:     Double-click the zip → it extracts automatically
  Linux:   Right-click → Extract, or run: unzip helpdesk_deploy_ready.zip

  You will now have a folder called "helpdesk" on your Desktop (or wherever you put it)

## Step 3.3 — Open terminal IN that folder
  Windows:
    1. Open the "helpdesk" folder in File Explorer
    2. Click the address bar at the top (where it says the path)
    3. Type "cmd" and press Enter → terminal opens in that folder!

  Mac:
    1. Open the "helpdesk" folder in Finder
    2. Right-click on the folder → "New Terminal at Folder"
    OR go to System Preferences → Keyboard → Shortcuts → Services → enable "New Terminal at Folder"

  Linux:
    Right-click inside the folder → "Open Terminal Here"

  VERIFY you are in the right place by typing:
    ls
  You should see folders like: backend  frontend  README.md  package.json

---

# ═══════════════════════════════════════
# PART 4 — STEP 1: GITHUB (code storage)
# ═══════════════════════════════════════

GitHub is like Google Drive, but for code.
Your code needs to live on GitHub so the hosting services can read it.

## Step 4.1 — Create a FREE GitHub account

  1. Open your browser
  2. Go to: https://github.com
  3. Click "Sign up"
  4. Enter your email address
  5. Create a password
  6. Choose a username (e.g. johnsmith2024 — this will be in your URL)
  7. Verify your email

## Step 4.2 — Create a new repository (a home for your code)

  "Repository" = a project folder on GitHub

  1. Log into GitHub
  2. Click the "+" button in the top-right corner
  3. Click "New repository"
  4. Fill in:
     - Repository name: desk-helpdesk
     - Description: IT Helpdesk System (optional)
     - Select: Public  ← IMPORTANT! Must be Public for free deployment
     - Do NOT tick "Add a README file" ← leave all boxes empty
  5. Click the green "Create repository" button

  You'll see a page with some code — LEAVE IT OPEN. You need the URL on that page.
  The URL will look like: https://github.com/YOURUSERNAME/desk-helpdesk

## Step 4.3 — Tell Git who you are (one time only)

  In your terminal, type these two commands (replace with YOUR details):

    git config --global user.email "you@youremail.com"
    git config --global user.name "Your Name"

  Press Enter after each one. No response means it worked.

## Step 4.4 — Push your code to GitHub

  Make sure you are in the "helpdesk" folder in your terminal.
  Then run these commands ONE BY ONE (press Enter after each):

    git init

    git add .

    git commit -m "First commit - DESK IT Helpdesk System"

    git branch -M main

    git remote add origin https://github.com/YOURUSERNAME/desk-helpdesk.git

    git push -u origin main

  ⚠️ Replace YOURUSERNAME with your actual GitHub username!

  When you run the last command it may ask for:
  - Username: type your GitHub username
  - Password: type your GitHub password
    (on newer Git it opens a browser to authenticate — just log in)

## ✅ CHECK: Did it work?

  Go to: https://github.com/YOURUSERNAME/desk-helpdesk

  You should see all your files and folders listed there!
  If you see them → STEP 1 COMPLETE! 🎉

---

# ═══════════════════════════════════════
# PART 5 — STEP 2: MONGODB ATLAS (database)
# ═══════════════════════════════════════

MongoDB Atlas is where ALL your data will be stored:
users, tickets, comments, everything.
It's like a Google Sheets but for applications.
FREE tier gives you 512MB — enough for thousands of tickets.

## Step 5.1 — Create account

  1. Go to: https://www.mongodb.com/cloud/atlas/register
  2. Sign up with Google (fastest) or fill in the form
  3. Answer the questions (choose "Learning MongoDB" and "Free tier")

## Step 5.2 — Create your free database cluster

  After signing up you land on a page to create a cluster:
  1. Choose "M0 FREE" (the free option — make sure it says $0/month)
  2. Cloud Provider: AWS (or any)
  3. Region: choose the one closest to your country
  4. Cluster Name: Cluster0 (leave default)
  5. Click "Create Deployment"

## Step 5.3 — Create a database username and password

  A popup will appear asking to create a user:
  1. Username: deskadmin
  2. Password: Click "Autogenerate Secure Password"
  3. ⚠️ COPY AND SAVE THAT PASSWORD SOMEWHERE — you'll need it!
  4. Click "Create Database User"
  5. Click "Choose a connection method" or "Done"

## Step 5.4 — Allow connections from anywhere

  Your hosting server (Railway) will have a different IP every day.
  You need to tell MongoDB to allow ALL IPs.

  1. In the left menu, click "Network Access"
  2. Click the green "Add IP Address" button
  3. Click "Allow Access From Anywhere"
  4. Click "Confirm"
  5. Wait ~1 minute for it to become Active (green dot)

## Step 5.5 — Get your connection string

  This is the "address" your app uses to find the database.

  1. In the left menu, click "Database" (under Deployment)
  2. Click the "Connect" button on your Cluster0
  3. Click "Drivers"
  4. Make sure Driver is "Node.js"
  5. You will see a string like this:
     mongodb+srv://deskadmin:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority

  6. Copy it somewhere safe
  7. Replace <password> with the ACTUAL password you saved in Step 5.3
  8. Add the database name "helpdesk_db" before the "?":
     mongodb+srv://deskadmin:YOURPASSWORD@cluster0.abc123.mongodb.net/helpdesk_db?retryWrites=true&w=majority

  ⚠️ SAVE THIS FULL STRING — you need it in the next step!

## ✅ CHECK: Did it work?

  The cluster should show as "Active" with a green indicator.
  You have your connection string saved → STEP 2 COMPLETE! 🎉

---

# ═══════════════════════════════════════
# PART 6 — STEP 3: RAILWAY (backend hosting)
# ═══════════════════════════════════════

Railway is where your backend (the brain) will live online.
It reads your code from GitHub and runs it 24/7.
FREE tier gives you $5 credit/month — enough for this project.

## Step 6.1 — Create Railway account

  1. Go to: https://railway.app
  2. Click "Login"
  3. Click "Login with GitHub"
  4. Authorize Railway to access your GitHub
  5. You're in!

## Step 6.2 — Create a new project

  1. Click "New Project" button
  2. Click "Deploy from GitHub repo"
  3. Find "desk-helpdesk" in the list and click it
  4. Railway will start analyzing your code

## Step 6.3 — Configure the backend service

  Railway might auto-detect both frontend and backend.
  You want to deploy ONLY the backend here.

  1. If Railway asks about configuration, look for a service that appeared
  2. Click on the service
  3. Click "Settings" tab
  4. Find "Root Directory" — type: backend
  5. Find "Build Command" — leave empty or type: npm install
  6. Find "Start Command" — type: node server.js
  7. Click "Save"

## Step 6.4 — Add Environment Variables

  These are the secret settings your app needs.
  Never put these in code — always use environment variables.

  1. Click on your service
  2. Click the "Variables" tab
  3. Click "Add Variable" and add EACH one below:

  ┌────────────────────┬──────────────────────────────────────────────────────┐
  │ Variable Name      │ Value (what to type)                                 │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ NODE_ENV           │ production                                           │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ MONGO_URI          │ (paste your full MongoDB string from Step 5.5)       │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ JWT_SECRET         │ (copy exactly):                                      │
  │                    │ 261959ad2756c0dc465d4a705f8f109790375b4aea4834e1a   │
  │                    │ 1a00e6b128f1400e9ea3fa6f2dd91f85161cb81708d2ad08b  │
  │                    │ 57c4da2e8e3ca3c2f2d36d4cea89f1                      │
  │                    │ (all one line, no spaces)                            │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ JWT_EXPIRE         │ 7d                                                   │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ MAX_FILE_SIZE      │ 10485760                                             │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ UPLOAD_PATH        │ ./uploads                                            │
  ├────────────────────┼──────────────────────────────────────────────────────┤
  │ CLIENT_URL         │ (leave blank for now — fill in after Step 7)        │
  └────────────────────┴──────────────────────────────────────────────────────┘

  After adding all variables, Railway will automatically redeploy.

## Step 6.5 — Get your backend live URL

  1. Click on your service
  2. Click "Settings" tab
  3. Scroll to "Networking" or "Domains"
  4. Click "Generate Domain"
  5. You get a URL like: desk-helpdesk-production.up.railway.app
  6. ⚠️ SAVE THIS URL — you need it in Step 7!

## Step 6.6 — Verify the backend is running

  Open your browser and go to:
    https://YOUR-RAILWAY-URL.up.railway.app/api/health

  You should see:
    {"success":true,"message":"DESK API is running"}

  If you see that — your backend is ALIVE on the internet! 🌍

## ✅ STEP 3 COMPLETE! 🎉

---

# ═══════════════════════════════════════
# PART 7 — STEP 4: LOAD DEMO DATA
# ═══════════════════════════════════════

Your database is empty right now. Let's fill it with
demo users and tickets so you can log in and test.

## Option A — Using Terminal (Recommended)

  You need to run the seeder pointing at your Atlas database.

  In your terminal, go to the backend folder:

  Windows:
    cd Desktop\helpdesk\backend

  Mac/Linux:
    cd ~/Desktop/helpdesk/backend

  Then run this command (replace EVERYTHING in caps with your real values):

    MONGO_URI="mongodb+srv://deskadmin:YOURPASSWORD@cluster0.YOURCLUSTER.mongodb.net/helpdesk_db?retryWrites=true&w=majority" node utils/seeder.js

  ⚠️ The whole thing is ONE line. Paste your full connection string inside the quotes.

  You should see:
    ✅ MongoDB Connected
    🌱 Starting database seed...
    ✅ Created 7 users
    ✅ Created 8 tickets
    🎉 Database seeded successfully!

## Option B — Railway CLI (alternative)

  If Option A doesn't work, install Railway's tool:

    npm install -g @railway/cli
    railway login
    cd helpdesk/backend
    railway link    (choose your project)
    railway run node utils/seeder.js

## ✅ STEP 4 COMPLETE! 🎉

---

# ═══════════════════════════════════════
# PART 8 — STEP 5: VERCEL (frontend hosting)
# ═══════════════════════════════════════

Vercel is where your frontend (the website you see) will live.
It's completely free for personal projects.

## Step 8.1 — Create Vercel account

  1. Go to: https://vercel.com
  2. Click "Sign Up"
  3. Click "Continue with GitHub"
  4. Authorize Vercel
  5. Choose "Hobby" plan (free) when asked

## Step 8.2 — Import your project

  1. You'll land on the Vercel dashboard
  2. Click "Add New..." → "Project"
  3. You'll see a list of your GitHub repos
  4. Find "desk-helpdesk" and click "Import"

## Step 8.3 — Configure the project

  IMPORTANT — you must set this up correctly:

  1. In the "Configure Project" screen:
  2. Find "Root Directory" — click "Edit" and type: frontend
     (This tells Vercel to deploy only the frontend folder)
  3. Framework Preset should auto-show as "Create React App" ✓
  4. Build Command: npm run build  (auto-detected, leave it)
  5. Output Directory: build  (auto-detected, leave it)

## Step 8.4 — Add Environment Variables

  BEFORE clicking Deploy, scroll down to "Environment Variables":

  1. Click "Add"
  2. Name:  REACT_APP_API_URL
     Value: https://YOUR-RAILWAY-URL.up.railway.app/api
     (paste the Railway URL from Step 6.5, add /api at the end!)

  3. Click "Add" again
  4. Name:  REACT_APP_NAME
     Value: DESK IT Helpdesk

  Example of what REACT_APP_API_URL should look like:
    https://desk-helpdesk-production.up.railway.app/api

## Step 8.5 — Deploy!

  Click the "Deploy" button.
  Vercel will take 1-3 minutes to build and deploy.
  You'll see a progress screen with green checkmarks.

  When done, you'll see "Congratulations!" and a URL like:
    https://desk-helpdesk.vercel.app

  ⚠️ SAVE THIS URL — your website address!

## ✅ STEP 5 COMPLETE! Your frontend is live! 🎉

---

# ═══════════════════════════════════════
# PART 9 — STEP 6: CONNECT THEM TOGETHER
# ═══════════════════════════════════════

The backend needs to know where the frontend is (for security).
You need to update one variable in Railway.

## Step 9.1 — Update Railway with your Vercel URL

  1. Go back to railway.app
  2. Click on your project → your service
  3. Click "Variables" tab
  4. Find "CLIENT_URL" (you left it blank earlier)
  5. Click to edit it
  6. Paste your Vercel URL: https://desk-helpdesk.vercel.app
  7. Also add a new variable:
     FRONTEND_URL = https://desk-helpdesk.vercel.app
  8. Railway will auto-redeploy (takes ~1 minute)

## ✅ STEP 6 COMPLETE! 🎉

---

# ═══════════════════════════════════════
# PART 10 — TESTING YOUR LIVE APP
# ═══════════════════════════════════════

## Open your live website

  Go to your Vercel URL (e.g. https://desk-helpdesk.vercel.app)

  You should see the DESK login page!

## Test all 3 roles

  TEST AS EMPLOYEE (sarah):
  - Email: sarah@company.com
  - Password: password123
  - Try: Submit a new ticket, view your tickets

  TEST AS TECHNICIAN (alex):
  - Email: alex@company.com
  - Password: password123
  - Try: Open a ticket, change its status, add a comment

  TEST AS ADMIN (david):
  - Email: david@company.com
  - Password: password123
  - Try: Go to Users, Audit Trail, Reports

## Full feature checklist

  □ Login page loads correctly
  □ Employee can log in
  □ Technician can log in
  □ Admin can log in
  □ Employee can submit a new ticket
  □ Ticket appears in the list
  □ Technician can change ticket status
  □ Comment thread works
  □ Notifications bell shows alerts
  □ Reports page shows charts (Admin/Tech)
  □ User Management page works (Admin)
  □ Audit Trail shows actions (Admin)
  □ Forgot Password flow works
  □ Profile page allows password change

---

# ═══════════════════════════════════════
# PART 11 — TROUBLESHOOTING (if things go wrong)
# ═══════════════════════════════════════

## Problem: "Cannot connect" or blank white page on Vercel
  Cause: REACT_APP_API_URL is wrong
  Fix:
  1. Go to Vercel → your project → Settings → Environment Variables
  2. Check that REACT_APP_API_URL ends with /api
  3. Check it matches your Railway URL exactly
  4. Go to Deployments → click the 3 dots → Redeploy

## Problem: "Network Error" when logging in
  Cause: Backend is down or CORS is wrong
  Fix:
  1. Test backend: open https://YOUR-RAILWAY-URL.up.railway.app/api/health
  2. If that fails → check Railway logs (your service → Logs tab)
  3. If health works but login fails → check CLIENT_URL in Railway variables

## Problem: Railway shows "Build failed"
  Cause: Railway can't find the files
  Fix:
  1. Click on your service → Settings
  2. Make sure Root Directory is set to: backend
  3. Make sure Start Command is: node server.js
  4. Redeploy

## Problem: "Invalid credentials" when logging in
  Cause: Database wasn't seeded
  Fix: Run the seeder command again (Step 7)

## Problem: "MongoServerError" in Railway logs
  Cause: MONGO_URI is wrong
  Fix:
  1. Double check the password in your connection string
  2. Make sure Network Access in MongoDB Atlas allows 0.0.0.0/0
  3. Update MONGO_URI in Railway variables

## Problem: git push fails with "authentication failed"
  Fix for newer Git versions:
  1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens
  2. Click "Tokens (classic)" → Generate new token
  3. Check: repo, workflow
  4. Copy the token
  5. Use this token as your password when Git asks

---

# ═══════════════════════════════════════
# PART 12 — WHAT YOU HAVE WHEN DONE
# ═══════════════════════════════════════

## Your live URLs:

  🌍 Frontend (the website):    https://desk-helpdesk.vercel.app
  ⚙️  Backend (the API):         https://YOUR-NAME.up.railway.app
  🗄️  Database:                  MongoDB Atlas → helpdesk_db

## Cost breakdown:

  MongoDB Atlas M0:   FREE (512MB, perfect for 1000s of tickets)
  Railway Starter:    FREE ($5 credit/month, covers ~500 hours)
  Vercel Hobby:       FREE forever (unlimited deployments)
  TOTAL:              $0/month 🎉

## What happens when someone uses it:

  1. User opens https://desk-helpdesk.vercel.app (Vercel serves the React app)
  2. They log in → React sends request to Railway backend
  3. Railway checks the password against MongoDB Atlas
  4. MongoDB confirms → Railway sends back a JWT token
  5. React stores token → user is logged in
  6. Every action (submit ticket, add comment) goes through same process

---

# SUMMARY OF ALL STEPS

  STEP 1: Create GitHub account → Push code to GitHub (5 min)
  STEP 2: Create MongoDB Atlas account → Get connection string (5 min)
  STEP 3: Create Railway account → Deploy backend → Add variables (5 min)
  STEP 4: Run seeder to load demo data (2 min)
  STEP 5: Create Vercel account → Deploy frontend → Add variables (5 min)
  STEP 6: Connect Vercel URL back to Railway CORS setting (1 min)
  TEST:   Open Vercel URL → Login → Test all features ✓

  TOTAL TIME: ~25 minutes
  TOTAL COST: $0

---

You've got this! Follow each step one at a time.
If anything goes wrong, the Troubleshooting section above has you covered.

Good luck! 🚀
