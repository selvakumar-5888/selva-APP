# StudyMind AI Platform

A full-stack AI-powered study platform built with **Vite + React + TypeScript + Supabase**.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Auth + DB | Supabase (PostgreSQL + Auth + Realtime) |
| State | Zustand |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form |
| Notifications | React Hot Toast |

## Project Structure

```
frontend/               ← Vite + React app
├── src/
│   ├── components/     ← Reusable UI components
│   │   ├── ui/         ← Button, Input, GlassCard, Badge
│   │   ├── layout/     ← TopBar, BottomNav, AppShell
│   │   └── shared/     ← StatCard, SessionCard
│   ├── pages/          ← All 30+ page components
│   ├── hooks/          ← useAuth, useUser, useStudyData
│   ├── lib/            ← supabase.ts client
│   ├── store/          ← Zustand stores (auth, ui)
│   ├── types/          ← TypeScript types + DB types
│   └── router/         ← React Router config + guards
└── supabase/
    └── migrations/     ← SQL schema files
```

## Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Variables
The `.env` file is already configured with your Supabase project.

### 3. Apply Database Schema
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/mqetkydjiqobhxrsiyhr/sql)
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL

### 4. Start Development Server
```bash
cd frontend
npm run dev
```

## Features

- 🔐 **Auth** — Email/password signup & login via Supabase Auth
- 🎓 **Onboarding** — Role, goals, subjects, study style quiz
- 📊 **Dashboard** — Daily stats, AI study plan, velocity chart
- ⏱️ **Study Sessions** — Pomodoro timer, focus tracking
- 🃏 **Flashcards** — AI-generated decks, spaced repetition
- 📝 **Notes** — Rich text editor with subjects + tags
- ✅ **Tasks** — Kanban board (To Do → In Progress → Done)
- 📈 **Analytics** — Study velocity, subject breakdown
- 🤖 **AI Insights** — Personalized study recommendations
- 🏆 **Rewards** — Streak tracking, XP, achievements
- 👥 **Study Groups** — Realtime collaboration
- ⚙️ **Settings** — Profile, reminders, preferences
- 💎 **Premium** — Subscription upgrade page


## Prompt ( edha apadiye copy pani antigravity la paste paniru )
analysis this complete project and understand the project mind and continue test this using chrome extension if you occur any error retity and debug that 
