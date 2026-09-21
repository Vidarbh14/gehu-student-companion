# GEHU Scraper & Ingestion Pipeline

## 1. Overview

The GEHU Student Companion utilizes a modular, legal, and respectful data ingestion pipeline to aggregate publicly available Graphic Era Hill University (GEHU) academic dates, notices, and examination circulars.

## 2. Public Sources

| Adapter Name | Source URL | Purpose |
| :--- | :--- | :--- |
| `GEHUCalendarSource` | `https://gehu.ac.in/dehradun/academics/calendar/` | Extracts teaching commencement, holidays, and semester milestones |
| `GEHUExamSource` | `https://gehu.ac.in/dehradun/exam-portal/` | Extracts regular and carryover (back-paper) datesheets |
| `GEHUNoticeSource` | `https://gehu.ac.in/dehradun/student-area/` | Collects public circulars, fee notifications, and event notices |
| `GEHUStudentPortalSource` | `https://student.gehu.ac.in/` | Verifies ERP health and surfaces official redirect links |

---

## 3. Legal and Security Boundaries

In accordance with strict security standards:
- **No CAPTCHA Bypassing:** We do NOT automate or circumvent CAPTCHA challenges.
- **No Brute-Force Authentication:** We do NOT probe passwords or access accounts without authorization.
- **No Scraping Behind Auth:** Private ERP dashboards (`student.gehu.ac.in`) are treated as external systems. Users are provided secure redirect links or manual/OCR import.
- **Respectful Request Rates:** All scrapers use exponential backoff, User-Agent disclosure, and avoid duplicate requests via SHA256 content hashing.

---

## 4. Change Detection

Every ingested record is hashed with SHA256:
```ts
const hash = crypto.createHash("sha256").update(content.trim()).digest("hex");
```
When GEHU publishes a **Revised Datesheet** or updated notice:
1. The hash comparison detects difference between the stored record and newly fetched record.
2. The existing record status is updated to `REVISED`.
3. The dashboard alerts students with clear Old vs New scheduling comparisons.
