# Architecture: GEHU Student Companion

The **GEHU Student Companion** is engineered as a student-focused academic intelligence layer and attendance planner around Graphic Era Hill University (GEHU).

---

## 1. High-Level Architecture

```mermaid
flowchart TD
    subgraph Client Layer [Modern Frontend - Next.js 14 App Router]
        Landing[Landing Page]
        Dash[Main Dashboard]
        AttCenter[Attendance Center]
        MissTomorrow["Can I Miss Tomorrow?" Feature]
        Sim[What-If Simulator & Graph]
        TT[Weekly Timetable]
        Cal[Academic Calendar]
        Exams[Exams & Back Papers]
        Notices[Notices Aggregator]
        Admin[Admin Scraper Center]
        Privacy["Privacy & Data Purge"]
    end

    subgraph Logic & Calculation Layer
        MathEngine[Attendance Engine]
        DateEngine[Date-Aware Calendar Engine]
        TimetableEngine[Timetable Engine]
        NotificationService[Notification Service]
    end

    subgraph Data Ingestion & Parser Pipeline
        ScraperMgr[Scraper Manager]
        CalSource[GEHUCalendarSource]
        ExamSource[GEHUExamSource]
        NoticeSource[GEHUNoticeSource]
        PortalSource[GEHUStudentPortalSource]
        CSVParser[CSV Parser]
        JSONParser[JSON Parser]
        OCRParser[OCR Screenshot Parser]
    end

    subgraph Persistence Layer
        PrismaORM[Prisma ORM Client]
        SQLiteDB[(SQLite / PostgreSQL DB)]
    end

    Client Layer --> Logic & Calculation Layer
    Client Layer --> Data Ingestion & Parser Pipeline
    Logic & Calculation Layer --> PrismaORM
    Data Ingestion & Parser Pipeline --> PrismaORM
    PrismaORM --> SQLiteDB
```

---

## 2. Ingestion Pipeline

```
SOURCE (Public GEHU URL)
  ↓
FETCH (Respectful rate, User-Agent, Exponential backoff)
  ↓
PARSE (Cheerio DOM / Regular expressions / Table rows)
  ↓
NORMALIZE (Assign canonical schema, Campus, Academic Year)
  ↓
VALIDATE (Zod runtime validation, Content Hash SHA256)
  ↓
STORE (Prisma ORM upsert, ScrapeJob audit log)
  ↓
SERVE (Optimized REST APIs to Next.js App Router)
```

---

## 3. Directory Layout

```
/app
  ├── /api
  │    ├── /dashboard/route.ts
  │    ├── /attendance/route.ts
  │    ├── /attendance/miss-tomorrow/route.ts
  │    ├── /attendance/forecast/route.ts
  │    ├── /attendance/what-if/route.ts
  │    ├── /timetable/route.ts
  │    ├── /calendar/route.ts
  │    ├── /exams/route.ts
  │    ├── /notices/route.ts
  │    ├── /documents/route.ts
  │    ├── /sources/route.ts
  │    ├── /sync/route.ts
  │    ├── /import/route.ts
  │    ├── /notifications/route.ts
  │    └── /profile/data/route.ts
  ├── /dashboard/page.tsx
  ├── /attendance/page.tsx
  ├── /miss-tomorrow/page.tsx
  ├── /simulator/page.tsx
  ├── /timetable/page.tsx
  ├── /calendar/page.tsx
  ├── /exams/page.tsx
  ├── /back-papers/page.tsx
  ├── /documents/page.tsx
  ├── /notices/page.tsx
  ├── /admin/page.tsx
  ├── /profile/page.tsx
  ├── /privacy/page.tsx
  ├── layout.tsx
  ├── page.tsx
  └── globals.css
/components
  ├── AttendanceRing.tsx
  ├── ClientShell.tsx
  ├── CommandPalette.tsx
  ├── ImportModal.tsx
  ├── MobileNav.tsx
  ├── Navbar.tsx
  ├── NotificationDropdown.tsx
  ├── SourceBadge.tsx
  └── StatusBadge.tsx
/lib
  ├── /attendance
  │    ├── attendanceEngine.ts
  │    └── attendanceEngine.test.ts
  ├── /calendar
  │    └── calendarEngine.ts
  ├── /timetable
  │    └── timetableEngine.ts
  ├── /parsers
  │    ├── csvParser.ts
  │    ├── jsonParser.ts
  │    ├── ocrParser.ts
  │    ├── pdfCalendarParser.ts
  │    └── parsers.test.ts
  ├── /scrapers
  │    ├── baseSource.ts
  │    ├── gehuCalendarSource.ts
  │    ├── gehuExamSource.ts
  │    ├── gehuNoticeSource.ts
  │    ├── gehuStudentPortalSource.ts
  │    ├── scraperManager.ts
  │    └── types.ts
  ├── /notifications
  │    └── notificationService.ts
  └── /db
       └── prisma.ts
/prisma
  ├── schema.prisma
  └── seed.js
/types
  └── index.ts
```
