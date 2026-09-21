import { prisma } from "../db/prisma";
import { GEHUCalendarSource } from "./gehuCalendarSource";
import { GEHUExamSource } from "./gehuExamSource";
import { GEHUNoticeSource } from "./gehuNoticeSource";
import { GEHUStudentPortalSource } from "./gehuStudentPortalSource";

export class ScraperManager {
  private calendarSource = new GEHUCalendarSource();
  private examSource = new GEHUExamSource();
  private noticeSource = new GEHUNoticeSource();
  private portalSource = new GEHUStudentPortalSource();

  /**
   * Synchronizes all GEHU public sources.
   */
  async syncAllSources() {
    const results = {
      calendar: await this.syncCalendar(),
      exams: await this.syncExams(),
      notices: await this.syncNotices(),
      portal: await this.syncPortal(),
    };
    return results;
  }

  async syncCalendar() {
    const startedAt = new Date();
    try {
      const result = await this.calendarSource.ingest();

      // Upsert data source
      const dataSource = await prisma.dataSource.upsert({
        where: { name: this.calendarSource.name },
        update: {
          lastScrapedAt: new Date(),
          lastStatus: "SUCCESS",
          recordsCount: result.totalFound,
          contentHash: result.metadata.contentHash,
          errorMessage: null,
        },
        create: {
          name: this.calendarSource.name,
          url: this.calendarSource.sourceUrl,
          type: "CALENDAR",
          lastScrapedAt: new Date(),
          lastStatus: "SUCCESS",
          recordsCount: result.totalFound,
          contentHash: result.metadata.contentHash,
        },
      });

      // Upsert academic events
      let newCount = 0;
      let updatedCount = 0;
      for (const ev of result.items) {
        const existing = await prisma.academicEvent.findUnique({
          where: { id: ev.id },
        });
        if (!existing) {
          await prisma.academicEvent.create({
            data: {
              id: ev.id,
              title: ev.title,
              type: ev.type,
              startDate: new Date(ev.startDate),
              endDate: new Date(ev.endDate),
              semester: ev.semester,
              campus: ev.campus,
              source: ev.source,
              sourceUrl: ev.sourceUrl,
              isOfficial: ev.isOfficial,
              description: ev.description,
            },
          });
          newCount++;
        } else {
          await prisma.academicEvent.update({
            where: { id: ev.id },
            data: {
              title: ev.title,
              startDate: new Date(ev.startDate),
              endDate: new Date(ev.endDate),
              description: ev.description,
            },
          });
          updatedCount++;
        }
      }

      await prisma.scrapeJob.create({
        data: {
          sourceId: dataSource.id,
          status: "SUCCESS",
          startedAt,
          finishedAt: new Date(),
          itemsFound: result.totalFound,
          itemsNew: newCount,
          itemsUpdated: updatedCount,
          logs: `Synced ${result.items.length} calendar events successfully.`,
        },
      });

      return { success: true, count: result.items.length, newCount, updatedCount };
    } catch (err: any) {
      console.error("[ScraperManager] Calendar sync error:", err);
      return { success: false, error: err.message };
    }
  }

  async syncExams() {
    const startedAt = new Date();
    try {
      const result = await this.examSource.ingest();

      const dataSource = await prisma.dataSource.upsert({
        where: { name: this.examSource.name },
        update: {
          lastScrapedAt: new Date(),
          lastStatus: "SUCCESS",
          recordsCount: result.totalFound,
          contentHash: result.metadata.contentHash,
          errorMessage: null,
        },
        create: {
          name: this.examSource.name,
          url: this.examSource.sourceUrl,
          type: "EXAMS",
          lastScrapedAt: new Date(),
          lastStatus: "SUCCESS",
          recordsCount: result.totalFound,
          contentHash: result.metadata.contentHash,
        },
      });

      let newCount = 0;
      let updatedCount = 0;
      for (const ex of result.items) {
        const existing = await prisma.exam.findUnique({
          where: { id: ex.id },
        });

        if (!existing) {
          await prisma.exam.create({
            data: {
              id: ex.id,
              subjectName: ex.subjectName,
              courseCode: ex.courseCode,
              date: new Date(ex.date),
              startTime: ex.startTime,
              endTime: ex.endTime,
              examType: ex.examType,
              semester: ex.semester,
              campus: ex.campus,
              room: ex.room,
              source: ex.source,
              sourceUrl: ex.sourceUrl,
              isBackPaper: ex.isBackPaper,
              backPaperDeadline: ex.backPaperDeadline
                ? new Date(ex.backPaperDeadline)
                : null,
              backPaperFee: ex.backPaperFee,
              officialNoticeUrl: ex.officialNoticeUrl,
              status: ex.status,
            },
          });
          newCount++;
        } else {
          // Check for change detection (e.g. revised date/time)
          const isDateChanged =
            existing.date.toISOString() !== new Date(ex.date).toISOString() ||
            existing.startTime !== ex.startTime;

          await prisma.exam.update({
            where: { id: ex.id },
            data: {
              date: new Date(ex.date),
              startTime: ex.startTime,
              endTime: ex.endTime,
              status: isDateChanged ? "REVISED" : ex.status,
              room: ex.room,
            },
          });
          updatedCount++;
        }
      }

      await prisma.scrapeJob.create({
        data: {
          sourceId: dataSource.id,
          status: "SUCCESS",
          startedAt,
          finishedAt: new Date(),
          itemsFound: result.totalFound,
          itemsNew: newCount,
          itemsUpdated: updatedCount,
          logs: `Synced ${result.items.length} exams.`,
        },
      });

      return { success: true, count: result.items.length, newCount, updatedCount };
    } catch (err: any) {
      console.error("[ScraperManager] Exam sync error:", err);
      return { success: false, error: err.message };
    }
  }

  async syncNotices() {
    const startedAt = new Date();
    try {
      const result = await this.noticeSource.ingest();

      const dataSource = await prisma.dataSource.upsert({
        where: { name: this.noticeSource.name },
        update: {
          lastScrapedAt: new Date(),
          lastStatus: "SUCCESS",
          recordsCount: result.totalFound,
          contentHash: result.metadata.contentHash,
          errorMessage: null,
        },
        create: {
          name: this.noticeSource.name,
          url: this.noticeSource.sourceUrl,
          type: "NOTICES",
          lastScrapedAt: new Date(),
          lastStatus: "SUCCESS",
          recordsCount: result.totalFound,
          contentHash: result.metadata.contentHash,
        },
      });

      let newCount = 0;
      let updatedCount = 0;
      for (const not of result.items) {
        const existing = await prisma.notice.findUnique({
          where: { id: not.id },
        });

        if (!existing) {
          await prisma.notice.create({
            data: {
              id: not.id,
              title: not.title,
              category: not.category,
              content: not.content,
              publishedAt: new Date(not.publishedAt),
              source: not.source,
              sourceUrl: not.sourceUrl,
              campus: not.campus,
              course: not.course,
              branch: not.branch,
              semester: not.semester,
              isPinned: not.isPinned,
            },
          });
          newCount++;
        } else {
          await prisma.notice.update({
            where: { id: not.id },
            data: {
              title: not.title,
              content: not.content,
              category: not.category,
              isPinned: not.isPinned,
            },
          });
          updatedCount++;
        }
      }

      await prisma.scrapeJob.create({
        data: {
          sourceId: dataSource.id,
          status: "SUCCESS",
          startedAt,
          finishedAt: new Date(),
          itemsFound: result.totalFound,
          itemsNew: newCount,
          itemsUpdated: updatedCount,
          logs: `Synced ${result.items.length} notices.`,
        },
      });

      return { success: true, count: result.items.length, newCount, updatedCount };
    } catch (err: any) {
      console.error("[ScraperManager] Notice sync error:", err);
      return { success: false, error: err.message };
    }
  }

  async syncPortal() {
    const startedAt = new Date();
    try {
      const result = await this.portalSource.ingest();

      const dataSource = await prisma.dataSource.upsert({
        where: { name: this.portalSource.name },
        update: {
          lastScrapedAt: new Date(),
          lastStatus: "SUCCESS",
          recordsCount: result.totalFound,
          contentHash: result.metadata.contentHash,
          errorMessage: null,
        },
        create: {
          name: this.portalSource.name,
          url: this.portalSource.sourceUrl,
          type: "STUDENT_PORTAL",
          lastScrapedAt: new Date(),
          lastStatus: "SUCCESS",
          recordsCount: result.totalFound,
          contentHash: result.metadata.contentHash,
        },
      });

      for (const doc of result.items) {
        await prisma.document.upsert({
          where: { id: doc.id },
          update: {
            title: doc.title,
            type: doc.type,
            status: doc.status,
            officialPortalUrl: doc.officialPortalUrl,
          },
          create: {
            id: doc.id,
            title: doc.title,
            type: doc.type,
            fileUrl: doc.fileUrl,
            isOfficial: true,
            requiresAuth: true,
            officialPortalUrl: doc.officialPortalUrl,
            publishedAt: new Date(doc.publishedAt),
            status: doc.status,
            semester: doc.semester,
            campus: doc.campus,
          },
        });
      }

      await prisma.scrapeJob.create({
        data: {
          sourceId: dataSource.id,
          status: "SUCCESS",
          startedAt,
          finishedAt: new Date(),
          itemsFound: result.totalFound,
          itemsNew: result.items.length,
          itemsUpdated: 0,
          logs: `Verified ${result.items.length} official student document links.`,
        },
      });

      return { success: true, count: result.items.length };
    } catch (err: any) {
      console.error("[ScraperManager] Portal sync error:", err);
      return { success: false, error: err.message };
    }
  }
}

export const scraperManager = new ScraperManager();
