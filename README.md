# 🧠 StudyMind AI — Complete Setup Guide for Beginners

Welcome! This guide will walk you through setting up your StudyMind AI app from scratch.
**Don't worry if you've never coded before — every step is explained simply.**

---

## 📋 What This App Does

StudyMind AI is a full-stack web application that helps students:
- 📅 Get AI-generated personalized study plans
- ✅ Track tasks with a drag-and-drop Kanban board
- ⏱️ Study with a built-in Pomodoro timer
- 🃏 Generate AI flashcards from your notes
- 📊 View analytics and AI-powered study insights
- 🔥 Build study streaks and earn badges

---

## 🛠️ Step 1: Install Required Tools

You need to install three programs. Click the links to download them:

### 1. Node.js (for the frontend and backend)
- Download from: **https://nodejs.org** → Click the green "LTS" button
- After installing, verify it works: open a terminal and type `node --version`
- You should see something like `v20.0.0` ✅

### 2. Python (for the AI service)
- Download from: **https://www.python.org/downloads/** → Click "Download Python 3.11"
- ⚠️ **IMPORTANT**: During installation, check the box that says "Add Python to PATH"
- After installing, verify: open a terminal and type `python --version`
- You should see `Python 3.11.x` ✅

### 3. Docker Desktop (to run the database)
- Download from: **https://www.docker.com/products/docker-desktop/**
- Install it and start it (you'll see a whale icon in your system tray)
- After installing, verify: open a terminal and type `docker --version`
- You should see `Docker version 24.x.x` ✅

---

## 📁 Step 2: Open the Project

1. Open a terminal (on Windows: search for "PowerShell" in Start menu)
2. Navigate to this folder:
   ```
   cd "C:\Users\suriy\OneDrive\Desktop\Selva app\studymind"
   ```

---

## 🔑 Step 3: Fill in Your Secret Keys

You need to fill in two files with your own secret values.

### File 1: `backend/.env`

Open the file `studymind/backend/.env` in any text editor (like Notepad) and change:

```
JWT_SECRET="change-me-to-a-long-random-string-32-chars-minimum"
```
→ Change to any long random text, like: `"mySecretKey2024StudyMindAppXYZ789"`

```
JWT_REFRESH_SECRET="change-me-to-another-different-random-string"
```
→ Change to a different random text, like: `"anotherSecretKey2024RefreshXYZ456"`

### File 2: `ai-service/.env`

Open `studymind/ai-service/.env` and change:

```
OPENAI_API_KEY="sk-your-openai-api-key-here"
```
→ Replace with your actual OpenAI API key

**How to get an OpenAI API key:**
1. Go to **https://platform.openai.com/api-keys**
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`) and paste it above

> 💡 **Note:** The app works without an OpenAI key, but AI features (plan generation, flashcard creation, insights) won't work.

---

## 🚀 Step 4: Start the App

The easiest way — using Docker (runs everything with one command):

### Option A: Docker (Recommended — easiest)

1. Make sure Docker Desktop is running (whale icon in system tray)
2. Open a terminal in the `studymind/` folder
3. Run this command:
   ```
   docker-compose up
   ```
4. Wait about 60-90 seconds for everything to start
5. You'll see messages like `🚀 StudyMind API running on http://localhost:5000`

### Option B: Manual (if Docker doesn't work)

Run each service in a **separate terminal window**:

**Terminal 1 — Database:**
```bash
# Install PostgreSQL first: https://www.postgresql.org/download/
# Then create a database called "studymind"
```

**Terminal 2 — Backend:**
```bash
cd studymind/backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**Terminal 3 — AI Service:**
```bash
cd studymind/ai-service
pip install -r requirements.txt
python main.py
```

**Terminal 4 — Frontend:**
```bash
cd studymind/frontend
npm install
npm run dev
```

---

## 🌐 Step 5: Open in Browser

Once everything is running, open your browser and go to:

```
http://localhost:3000
```

You should see the StudyMind splash screen! 🎉

**Demo Account (pre-loaded with sample data):**
- Email: `demo@studymind.ai`
- Password: `password123`

---

## 🗄️ Step 6: Run Database Migrations (only once)

If using the manual setup (Option B), you need to set up the database:

```bash
cd studymind/backend
npx prisma migrate dev --name init
npx prisma db seed
```

If using Docker, this happens automatically!

---

## 📱 Using the App

Once open at `http://localhost:3000`:

1. **First time?** → Click "Get Started Free" → Create an account
2. **Returning user?** → Click "Sign In" → Use the demo account
3. **After logging in:**
   - Complete the onboarding (4 steps: role, subjects, goals, learning style)
   - AI will generate your first study plan
   - You'll land on the Dashboard

---

## ❗ Common Errors and Fixes

### "Cannot connect to database"
- Make sure Docker Desktop is running
- Wait 30 more seconds — the database needs time to start
- Try: `docker-compose down && docker-compose up`

### "npm install" fails
- Make sure Node.js is installed correctly: `node --version`
- Try deleting `node_modules` folder and running `npm install` again

### "Python not found"
- Make sure Python is installed: `python --version`
- On Windows, you may need to use `python3` instead of `python`
- Reinstall Python and make sure to check "Add to PATH" ✅

### AI features don't work
- Check that `ai-service/.env` has your real OpenAI API key
- Make sure the key starts with `sk-`
- Check you have credits in your OpenAI account

### Port already in use
- Another app is using port 3000, 5000, or 8000
- Stop the other app, or change the port in `docker-compose.yml`

### "JWT_SECRET is required"
- You forgot to update `backend/.env`
- Make sure you changed the placeholder text to real values

---

## 🏗️ Project Structure (for reference)

```
studymind/
├── frontend/        ← The website (Next.js - what you see in the browser)
│   └── src/app/     ← All 30 pages
├── backend/         ← The API server (handles data, login, etc.)
│   ├── src/routes/  ← All API endpoints
│   └── prisma/      ← Database schema
├── ai-service/      ← Python AI features (OpenAI GPT-4o)
├── shared/          ← Types shared between frontend and backend
├── docker-compose.yml  ← Starts everything with one command
└── README.md        ← This file!
```

---

## 🔗 Service URLs (when running)

| Service | URL |
|---------|-----|
| Frontend (website) | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| AI Service | http://localhost:8000 |
| API Health Check | http://localhost:5000/health |
| AI Health Check | http://localhost:8000/health |

---

## 🛑 Stopping the App

To stop all services:
```bash
docker-compose down
```

To stop AND delete all data (fresh start):
```bash
docker-compose down -v
```

---

## 💡 Need Help?

If you're stuck, check:
1. Is Docker Desktop running? (check your system tray)
2. Did you fill in the `.env` files? (Step 3)
3. Are you in the right folder? (`studymind/` not `studymind/frontend/`)

Built with ❤️ using Next.js, Node.js, Python FastAPI, and OpenAI GPT-4o.
