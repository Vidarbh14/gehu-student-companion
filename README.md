# GEHU Student Companion — Academic Intelligence & Attendance Planner

A student-focused academic companion and attendance planner engineered around **Graphic Era Hill University (GEHU)**.

The goal is **not** to replace the official GEHU ERP (`student.gehu.ac.in`). The goal is to provide a modern, mathematically rigorous, and intelligent academic layer that transforms raw attendance and schedules into actionable student insights.

---

## 🌟 Core Product Principle

> *"Given my current attendance, timetable, academic calendar, and remaining classes, what can I safely miss while maintaining the required attendance percentage?"*

The application **never** guesses. Every prediction is derived mathematically from:
* Classes attended ($A$)
* Classes conducted ($C$)
* Official target attendance ($T$, default 75%)
* Customizable safety buffer ($B$, default 2% $\implies$ 77% effective target)
* Date-aware remaining teaching days (excluding holidays, festival vacations, and exam windows)
* Subject timetable slots

All data is strictly distinguished into:
1. **Official Data** (GEHU notices, datesheets, calendar)
2. **Data Scraped/Fetched from Public GEHU Sources**
3. **User-Entered Data**
4. **Calculated Predictions**

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* Node.js v18+ (tested on Node v24)
* npm or pnpm

### 2. Installation
```bash
# Clone or navigate to the repository
cd Attendance

# Install dependencies
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```ini
DATABASE_URL="file:./dev.db"
AUTH_SECRET="gehu-companion-super-secret-key-change-in-production-2026"
GEHU_PUBLIC_BASE_URL="https://gehu.ac.in"
GEHU_STUDENT_PORTAL="https://student.gehu.ac.in"
GEHU_CALENDAR_URL="https://gehu.ac.in/dehradun/academics/calendar/"
GEHU_EXAM_PORTAL_URL="https://gehu.ac.in/dehradun/exam-portal/"
GEHU_STUDENT_AREA_URL="https://gehu.ac.in/dehradun/student-area/"
ADMIN_SECRET_KEY="gehu-admin-2026"
```

### 4. Database Initialization & Seeding
```bash
# Push Prisma schema to SQLite dev.db
npx prisma db push

# Seed realistic GEHU student demo dataset
node prisma/seed.js
```

### 5. Run Test Suite
```bash
npm test
```

### 6. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment (Vercel)

The application is built with a 100% Vercel-compatible Next.js App Router architecture.

### Deployment Steps:
1. Push this repository to GitHub or GitLab.
2. In the Vercel Dashboard, import the repository.
3. Configure the Environment Variables in Vercel:
   * `DATABASE_URL`: Your PostgreSQL connection string (e.g., Neon Postgres, Supabase, or Vercel Postgres).
   * `AUTH_SECRET`: Random 32-character secret string.
   * `GEHU_PUBLIC_BASE_URL`: `https://gehu.ac.in`
   * `GEHU_STUDENT_PORTAL`: `https://student.gehu.ac.in`
4. In `prisma/schema.prisma`, update the provider from `sqlite` to `postgresql` when using PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Set Build Command: `npx prisma generate && next build`
6. Click **Deploy**.

---

## 🧮 Mathematical Formulas Implemented

* **Current Attendance %:**
  $$
  \text{Attendance} = \frac{A}{C} \times 100
  $$

* **Effective Target ($T_{eff}$):**
  $$
  T_{eff} = \text{Target} + \text{Buffer} \quad (\text{e.g. } 75\% + 2\% = 77\%)
  $$

* **Maximum Immediate Absences:**
  $$
  x_{max} = \max\left(0, \left\lfloor \frac{A}{T_{eff}} - C \right\rfloor\right)
  $$

* **Maximum Future Absences across $R$ Scheduled Classes:**
  $$
  m_{max} = \min\left(R, \max\left(0, \lfloor A + R - T_{eff} \cdot (C + R) \rfloor\right)\right)
  $$

* **Consecutive Recovery Classes Needed (when $A/C < T$):**
  $$
  y_{min} = \left\lceil \frac{T \cdot C - A}{1 - T} \right\rceil
  $$

---

## ✅ Implemented Features List

1. **Deterministic Attendance Engine:** Division-by-zero protected, strict formula execution, unit-tested with Vitest.
2. **Attendance Freedom Card:** Subject-by-subject margin breakdown and total safe absences.
3. **"Can I Miss Tomorrow?" Feature:** Date-aware evaluation of tomorrow's timetable against buffer limits with clear YES / NO badges.
4. **Attendance Recovery Mode:** Step-by-step recovery plan for critical subjects.
5. **Interactive What-If Simulator:** Sliders and Recharts forecast curves against a horizontal target threshold line.
6. **Goal Planner:** "I want to reach 80% $\implies$ attend $X$ consecutive lectures."
7. **Date-Aware Remaining Classes Engine:** Traverses the calendar to semester end, skipping holidays, Sundays, and exam periods.
8. **Weekly Timetable Grid:** Monday to Saturday class organizer with room, faculty, start/end time, and lab/theory categorization.
9. **GEHU Academic Calendar:** Milestones, practical windows, mid-sem, end-sem, and official PDF event parser.
10. **Examination Center & Countdown:** Nearest exam countdown card in days/shift.
11. **Back-Paper Module:** Dedicated carryover portal with course codes, form deadlines, fee notes, and "Add to my exams".
12. **Admit Card & Exam Documents:** Direct official link to `student.gehu.ac.in` with security notice.
13. **Notice Board Aggregator:** Public circulars categorized into Exams, Attendance, Fees, Back-Papers, and personalized profile matching (`Matched to your profile`).
14. **Global Command Palette:** Fast keyboard navigation via `Ctrl+K` or `/`.
15. **Import Pipeline:** Supports CSV (attendance & timetable), structured JSON, and screenshot OCR verification.
16. **Admin Scraper Health Center:** Real-time source health, job logs, and manual sync triggers.
17. **Privacy Policy & "Delete My Data":** Irreversible single-click local data purge.
18. **Dark Mode / Light Mode:** First-class responsive UI with glassmorphism cards and smooth transitions.

---

## 🔒 Features Requiring Authenticated GEHU Integration

Per ethical, legal, and security principles, the application does **not** bypass security controls:
1. **Automated ERP Attendance Sync:** `https://student.gehu.ac.in` is protected by user authentication and CAPTCHA. The application uses manual entry, CSV/JSON import, or user-uploaded screenshot OCR with mandatory review.
2. **Direct Admit Card Binary Download:** Admit cards contain sensitive student data behind session authentication. The application directs students to the official portal login rather than storing credentials.
3. **Official Fee Payment Submission:** Payments must be processed through the official university payment gateway.

---

## 🛡️ Security & Privacy Notice

* No CAPTCHA bypassing.
* No private student data scraping.
* No brute-forcing of credentials.
* No plain-text passwords stored.
* All external links point to verified Graphic Era Hill University domains (`gehu.ac.in` and `student.gehu.ac.in`).
