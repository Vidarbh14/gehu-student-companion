const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding GEHU Student Companion database...");

  // 1. Clean up existing demo records
  await prisma.notification.deleteMany({});
  await prisma.timetableEntry.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.attendanceTarget.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.academicEvent.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.scrapeJob.deleteMany({});
  await prisma.dataSource.deleteMany({});

  // 2. Demo User
  const demoUser = await prisma.user.create({
    data: {
      id: "demo-user-1",
      email: "demo@gehu.ac.in",
      name: "Demo Student",
      isAdmin: true,
      profile: {
        create: {
          universityId: "GEHU/2024/CSE/1042",
          rollNumber: "24150021",
          registrationNumber: "REG20249876",
          campus: "Dehradun",
          course: "B.Tech",
          branch: "CSE",
          semester: "III",
          section: "A",
          batch: "2024-2028",
          academicYear: "2026-27",
        },
      },
      target: {
        create: {
          targetPercentage: 75.0,
          safetyBuffer: 2.0,
          strictMode: false,
        },
      },
    },
  });

  console.log("Created demo student:", demoUser.name);

  // 3. Subjects and Attendance
  const subjectsData = [
    {
      id: "sub-dsa",
      code: "TCS-301",
      name: "Data Structures & Algorithms",
      credits: 4,
      type: "THEORY",
      color: "#0c81eb",
      conducted: 42,
      attended: 36, // 85.71% -> SAFE
    },
    {
      id: "sub-math",
      code: "TCS-302",
      name: "Discrete Mathematics & Graph Theory",
      credits: 4,
      type: "THEORY",
      color: "#8b5cf6",
      conducted: 40,
      attended: 31, // 77.50% -> WATCH
    },
    {
      id: "sub-os",
      code: "TCS-303",
      name: "Operating Systems Principles",
      credits: 4,
      type: "THEORY",
      color: "#10b981",
      conducted: 38,
      attended: 33, // 86.84% -> SAFE
    },
    {
      id: "sub-de",
      code: "TEC-301",
      name: "Digital Electronics & Logic Design",
      credits: 3,
      type: "THEORY",
      color: "#ef4444",
      conducted: 36,
      attended: 26, // 72.22% -> CRITICAL
    },
    {
      id: "sub-coa",
      code: "TCS-304",
      name: "Computer Organization & Architecture",
      credits: 3,
      type: "THEORY",
      color: "#f59e0b",
      conducted: 35,
      attended: 27, // 77.14% -> RISK
    },
    {
      id: "sub-dsalab",
      code: "PCS-301",
      name: "Data Structures Laboratory",
      credits: 1,
      type: "LAB",
      color: "#06b6d4",
      conducted: 12,
      attended: 11, // 91.67% -> SAFE
    },
  ];

  for (const s of subjectsData) {
    const createdSubject = await prisma.subject.create({
      data: {
        id: s.id,
        userId: demoUser.id,
        code: s.code,
        name: s.name,
        credits: s.credits,
        type: s.type,
        color: s.color,
        attendance: {
          create: {
            conducted: s.conducted,
            attended: s.attended,
            source: "MANUAL",
            notes: "Verified from student ERP portal",
          },
        },
      },
    });
  }

  // 4. Timetable Entries (Monday to Saturday)
  const timetableSlots = [
    // Monday
    {
      userId: demoUser.id,
      subjectId: "sub-dsa",
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "10:00",
      room: "Block C - Room 204",
      faculty: "Dr. A. K. Sharma",
      classType: "THEORY",
    },
    {
      userId: demoUser.id,
      subjectId: "sub-os",
      dayOfWeek: "MONDAY",
      startTime: "10:00",
      endTime: "11:00",
      room: "Block C - Room 204",
      faculty: "Prof. Neha Gupta",
      classType: "THEORY",
    },
    {
      userId: demoUser.id,
      subjectId: "sub-math",
      dayOfWeek: "MONDAY",
      startTime: "11:15",
      endTime: "12:15",
      room: "Block C - Room 301",
      faculty: "Dr. R. C. Joshi",
      classType: "THEORY",
    },
    {
      userId: demoUser.id,
      subjectId: "sub-dsalab",
      dayOfWeek: "MONDAY",
      startTime: "14:00",
      endTime: "16:00",
      room: "Computing Lab 4",
      faculty: "Er. Rohit Rawat",
      classType: "LAB",
    },

    // Tuesday
    {
      userId: demoUser.id,
      subjectId: "sub-dsa",
      dayOfWeek: "TUESDAY",
      startTime: "09:00",
      endTime: "10:00",
      room: "Block C - Room 204",
      faculty: "Dr. A. K. Sharma",
      classType: "THEORY",
    },
    {
      userId: demoUser.id,
      subjectId: "sub-de",
      dayOfWeek: "TUESDAY",
      startTime: "10:00",
      endTime: "11:00",
      room: "Block B - Room 108",
      faculty: "Dr. S. K. Singh",
      classType: "THEORY",
    },
    {
      userId: demoUser.id,
      subjectId: "sub-coa",
      dayOfWeek: "TUESDAY",
      startTime: "11:15",
      endTime: "12:15",
      room: "Block C - Room 204",
      faculty: "Prof. Priya Verma",
      classType: "THEORY",
    },

    // Wednesday
    {
      userId: demoUser.id,
      subjectId: "sub-math",
      dayOfWeek: "WEDNESDAY",
      startTime: "09:00",
      endTime: "10:00",
      room: "Block C - Room 301",
      faculty: "Dr. R. C. Joshi",
      classType: "THEORY",
    },
    {
      userId: demoUser.id,
      subjectId: "sub-os",
      dayOfWeek: "WEDNESDAY",
      startTime: "10:00",
      endTime: "11:00",
      room: "Block C - Room 204",
      faculty: "Prof. Neha Gupta",
      classType: "THEORY",
    },
    {
      userId: demoUser.id,
      subjectId: "sub-de",
      dayOfWeek: "WEDNESDAY",
      startTime: "11:15",
      endTime: "12:15",
      room: "Block B - Room 108",
      faculty: "Dr. S. K. Singh",
      classType: "THEORY",
    },

    // Thursday
    {
      userId: demoUser.id,
      subjectId: "sub-dsa",
      dayOfWeek: "THURSDAY",
      startTime: "09:00",
      endTime: "10:00",
      room: "Block C - Room 204",
      faculty: "Dr. A. K. Sharma",
      classType: "THEORY",
    },
    {
      userId: demoUser.id,
      subjectId: "sub-coa",
      dayOfWeek: "THURSDAY",
      startTime: "10:00",
      endTime: "11:00",
      room: "Block C - Room 204",
      faculty: "Prof. Priya Verma",
      classType: "THEORY",
    },
    {
      userId: demoUser.id,
      subjectId: "sub-os",
      dayOfWeek: "THURSDAY",
      startTime: "11:15",
      endTime: "12:15",
      room: "Block C - Room 204",
      faculty: "Prof. Neha Gupta",
      classType: "THEORY",
    },

    // Friday
    {
      userId: demoUser.id,
      subjectId: "sub-math",
      dayOfWeek: "FRIDAY",
      startTime: "09:00",
      endTime: "10:00",
      room: "Block C - Room 301",
      faculty: "Dr. R. C. Joshi",
      classType: "THEORY",
    },
    {
      userId: demoUser.id,
      subjectId: "sub-de",
      dayOfWeek: "FRIDAY",
      startTime: "10:00",
      endTime: "11:00",
      room: "Block B - Room 108",
      faculty: "Dr. S. K. Singh",
      classType: "THEORY",
    },
    {
      userId: demoUser.id,
      subjectId: "sub-coa",
      dayOfWeek: "FRIDAY",
      startTime: "11:15",
      endTime: "12:15",
      room: "Block C - Room 204",
      faculty: "Prof. Priya Verma",
      classType: "THEORY",
    },

    // Saturday
    {
      userId: demoUser.id,
      subjectId: "sub-dsa",
      dayOfWeek: "SATURDAY",
      startTime: "10:00",
      endTime: "11:00",
      room: "Block C - Room 204",
      faculty: "Dr. A. K. Sharma",
      classType: "THEORY",
    },
  ];

  await prisma.timetableEntry.createMany({
    data: timetableSlots,
  });

  // 5. Academic Calendar Events
  const calendarEvents = [
    {
      id: "ev-sem-start",
      title: "Commencement of Classes (Odd Semester 2026-27)",
      type: "SEMESTER_START",
      startDate: new Date("2026-08-01T00:00:00.000Z"),
      endDate: new Date("2026-08-01T23:59:59.000Z"),
      semester: "ALL",
      campus: "Dehradun",
      source: "GEHU Academic Calendar",
      sourceUrl: "https://gehu.ac.in/dehradun/academics/calendar/",
      isOfficial: true,
      description: "Official start of academic classes.",
    },
    {
      id: "ev-gandhi-jayanti",
      title: "Mahatma Gandhi Jayanti (University Holiday)",
      type: "HOLIDAY",
      startDate: new Date("2026-10-02T00:00:00.000Z"),
      endDate: new Date("2026-10-02T23:59:59.000Z"),
      semester: "ALL",
      campus: "Dehradun",
      source: "GEHU Academic Calendar",
      sourceUrl: "https://gehu.ac.in/dehradun/academics/calendar/",
      isOfficial: true,
      description: "National holiday. Classes suspended.",
    },
    {
      id: "ev-midsem",
      title: "Mid-Semester Examinations / Term Evaluation I",
      type: "MID_SEM",
      startDate: new Date("2026-10-12T00:00:00.000Z"),
      endDate: new Date("2026-10-17T23:59:59.000Z"),
      semester: "III",
      campus: "Dehradun",
      source: "GEHU Academic Calendar",
      sourceUrl: "https://gehu.ac.in/dehradun/academics/calendar/",
      isOfficial: true,
      description: "Mid-term evaluation for all undergraduate engineering programs.",
    },
    {
      id: "ev-dussehra",
      title: "Dussehra Break (University Holiday)",
      type: "HOLIDAY",
      startDate: new Date("2026-10-19T00:00:00.000Z"),
      endDate: new Date("2026-10-21T23:59:59.000Z"),
      semester: "ALL",
      campus: "Dehradun",
      source: "GEHU Academic Calendar",
      sourceUrl: "https://gehu.ac.in/dehradun/academics/calendar/",
      isOfficial: true,
      description: "Dussehra holiday break.",
    },
    {
      id: "ev-diwali",
      title: "Deepawali Vacation & University Holidays",
      type: "HOLIDAY",
      startDate: new Date("2026-11-06T00:00:00.000Z"),
      endDate: new Date("2026-11-10T23:59:59.000Z"),
      semester: "ALL",
      campus: "Dehradun",
      source: "GEHU Academic Calendar",
      sourceUrl: "https://gehu.ac.in/dehradun/academics/calendar/",
      isOfficial: true,
      description: "Diwali holiday recess.",
    },
    {
      id: "ev-practicals",
      title: "End Semester Practical Examinations",
      type: "PRACTICAL_EXAM",
      startDate: new Date("2026-11-23T00:00:00.000Z"),
      endDate: new Date("2026-11-28T23:59:59.000Z"),
      semester: "III",
      campus: "Dehradun",
      source: "GEHU Academic Calendar",
      sourceUrl: "https://gehu.ac.in/dehradun/academics/calendar/",
      isOfficial: true,
      description: "End semester laboratory practicals.",
    },
    {
      id: "ev-endsem",
      title: "End Semester Theory Examinations",
      type: "END_SEM",
      startDate: new Date("2026-12-01T00:00:00.000Z"),
      endDate: new Date("2026-12-18T23:59:59.000Z"),
      semester: "III",
      campus: "Dehradun",
      source: "GEHU Academic Calendar",
      sourceUrl: "https://gehu.ac.in/dehradun/academics/calendar/",
      isOfficial: true,
      description: "Final theory examinations for the odd semester.",
    },
    {
      id: "ev-sem-end",
      title: "Conclusion of Odd Semester & Winter Break",
      type: "SEMESTER_END",
      startDate: new Date("2026-12-24T00:00:00.000Z"),
      endDate: new Date("2026-12-24T23:59:59.000Z"),
      semester: "ALL",
      campus: "Dehradun",
      source: "GEHU Academic Calendar",
      sourceUrl: "https://gehu.ac.in/dehradun/academics/calendar/",
      isOfficial: true,
      description: "End of semester teaching and activities.",
    },
  ];

  await prisma.academicEvent.createMany({
    data: calendarEvents,
  });

  // 6. Exams (Regular & Back Papers)
  const exams = [
    {
      id: "ex-tcs-301",
      subjectName: "Data Structures & Algorithms",
      courseCode: "TCS-301",
      date: new Date("2026-10-12T10:00:00.000Z"),
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      examType: "MID_SEM",
      semester: "III",
      campus: "Dehradun",
      room: "Block C - Hall 101",
      source: "GEHU Exam Portal",
      sourceUrl: "https://gehu.ac.in/dehradun/exam-portal/",
      isBackPaper: false,
      status: "SCHEDULED",
    },
    {
      id: "ex-tcs-302",
      subjectName: "Discrete Mathematics & Graph Theory",
      courseCode: "TCS-302",
      date: new Date("2026-10-14T10:00:00.000Z"),
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      examType: "MID_SEM",
      semester: "III",
      campus: "Dehradun",
      room: "Block C - Hall 102",
      source: "GEHU Exam Portal",
      sourceUrl: "https://gehu.ac.in/dehradun/exam-portal/",
      isBackPaper: false,
      status: "SCHEDULED",
    },
    {
      id: "ex-tcs-303",
      subjectName: "Operating Systems Principles",
      courseCode: "TCS-303",
      date: new Date("2026-10-16T10:00:00.000Z"),
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      examType: "MID_SEM",
      semester: "III",
      campus: "Dehradun",
      room: "Block C - Hall 104",
      source: "GEHU Exam Portal",
      sourceUrl: "https://gehu.ac.in/dehradun/exam-portal/",
      isBackPaper: false,
      status: "SCHEDULED",
    },
    {
      id: "ex-tec-301",
      subjectName: "Digital Electronics & Logic Design",
      courseCode: "TEC-301",
      date: new Date("2026-10-17T14:00:00.000Z"),
      startTime: "02:00 PM",
      endTime: "05:00 PM",
      examType: "MID_SEM",
      semester: "III",
      campus: "Dehradun",
      room: "Block B - 202",
      source: "GEHU Exam Portal",
      sourceUrl: "https://gehu.ac.in/dehradun/exam-portal/",
      isBackPaper: false,
      status: "SCHEDULED",
    },
    // Back Papers
    {
      id: "ex-back-tcs-201",
      subjectName: "Programming in C & Problem Solving",
      courseCode: "TCS-201",
      date: new Date("2026-10-24T10:00:00.000Z"),
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      examType: "BACK_PAPER",
      semester: "II",
      campus: "Dehradun",
      room: "Examination Center Hall A",
      source: "GEHU Exam Portal",
      sourceUrl: "https://gehu.ac.in/dehradun/exam-portal/back-papers",
      isBackPaper: true,
      backPaperDeadline: new Date("2026-10-05T23:59:59.000Z"),
      backPaperFee: "₹1,000 per subject",
      officialNoticeUrl: "https://gehu.ac.in/dehradun/exam-portal/notices",
      status: "SCHEDULED",
    },
    {
      id: "ex-back-tma-101",
      subjectName: "Engineering Mathematics I",
      courseCode: "TMA-101",
      date: new Date("2026-10-26T14:00:00.000Z"),
      startTime: "02:00 PM",
      endTime: "05:00 PM",
      examType: "BACK_PAPER",
      semester: "I",
      campus: "Dehradun",
      room: "Examination Center Hall B",
      source: "GEHU Exam Portal",
      sourceUrl: "https://gehu.ac.in/dehradun/exam-portal/back-papers",
      isBackPaper: true,
      backPaperDeadline: new Date("2026-10-05T23:59:59.000Z"),
      backPaperFee: "₹1,000 per subject",
      officialNoticeUrl: "https://gehu.ac.in/dehradun/exam-portal/notices",
      status: "SCHEDULED",
    },
  ];

  await prisma.exam.createMany({
    data: exams,
  });

  // 7. Notices
  const notices = [
    {
      id: "not-1",
      title: "Urgent: Last Date for Submission of Back-Paper Examination Forms (Odd Sem 2026-27)",
      content:
        "All eligible students of B.Tech (CSE/IT/ECE) who wish to appear for Back-Paper / Carryover examinations must submit their filled forms along with the requisite fee receipt to the Examination Cell by October 5, 2026. Late submissions will attract penalty charges.",
      category: "BACK_PAPERS",
      publishedAt: new Date("2026-09-18T09:30:00.000Z"),
      source: "GEHU Exam Portal",
      sourceUrl: "https://gehu.ac.in/dehradun/exam-portal/notices",
      campus: "Dehradun",
      course: "B.Tech",
      branch: "CSE",
      semester: "III",
      isPinned: true,
    },
    {
      id: "not-2",
      title: "Revised Mid-Semester Examination Schedule for III & V Semester Students",
      content:
        "The Mid-Semester examinations for B.Tech CSE Semester III will commence from October 12, 2026. Students are advised to verify their seating arrangement and room allocations in Block C.",
      category: "EXAMS",
      publishedAt: new Date("2026-09-16T14:00:00.000Z"),
      source: "GEHU Exam Portal",
      sourceUrl: "https://gehu.ac.in/dehradun/exam-portal/",
      campus: "Dehradun",
      course: "B.Tech",
      branch: "CSE",
      semester: "III",
      isPinned: true,
    },
    {
      id: "not-3",
      title: "Strict Compliance of 75% Attendance Requirement for Mid-Semester Eligibility",
      content:
        "Notice from Dean Academics: Students possessing less than 75% cumulative attendance as on October 08, 2026, will not be issued admit cards for the upcoming Mid-Semester evaluations.",
      category: "ATTENDANCE",
      publishedAt: new Date("2026-09-15T11:20:00.000Z"),
      source: "GEHU Notice Board",
      sourceUrl: "https://gehu.ac.in/dehradun/student-area/",
      campus: "Dehradun",
      course: "B.Tech",
      branch: "CSE",
      semester: "ALL",
      isPinned: false,
    },
    {
      id: "not-4",
      title: "Admit Card Download Window for B.Tech Mid-Term Examinations",
      content:
        "Admit cards for eligible registered candidates will be made available for download directly through the Official GEHU Student Portal (https://student.gehu.ac.in). Please log in with your official university credentials.",
      category: "EXAMS",
      publishedAt: new Date("2026-09-20T10:15:00.000Z"),
      source: "GEHU Student Portal",
      sourceUrl: "https://student.gehu.ac.in",
      campus: "Dehradun",
      course: "B.Tech",
      branch: "CSE",
      semester: "III",
      isPinned: false,
    },
  ];

  await prisma.notice.createMany({
    data: notices,
  });

  // 8. Documents
  const documents = [
    {
      id: "doc-admit-card-2026",
      title: "Mid-Semester Examination Admit Card (Odd 2026-27)",
      type: "ADMIT_CARD",
      isOfficial: true,
      requiresAuth: true,
      officialPortalUrl: "https://student.gehu.ac.in/student/admit-card",
      publishedAt: new Date("2026-09-20T10:00:00.000Z"),
      status: "AVAILABLE",
      semester: "III",
      campus: "Dehradun",
    },
    {
      id: "doc-back-paper-2026",
      title: "Official Back-Paper Registration Form & Fee Slip",
      type: "BACK_PAPER_FORM",
      isOfficial: true,
      requiresAuth: true,
      officialPortalUrl: "https://student.gehu.ac.in/student/examination/back-paper",
      publishedAt: new Date("2026-09-15T09:00:00.000Z"),
      status: "AVAILABLE",
      semester: "III",
      campus: "Dehradun",
    },
    {
      id: "doc-seating-2026",
      title: "B.Tech Examination Seating Plan & Center Allocation",
      type: "SEATING_PLAN",
      isOfficial: true,
      requiresAuth: true,
      officialPortalUrl: "https://student.gehu.ac.in/student/seating-plan",
      publishedAt: new Date("2026-09-22T08:00:00.000Z"),
      status: "UPCOMING",
      semester: "III",
      campus: "Dehradun",
    },
    {
      id: "doc-syllabus-2026",
      title: "B.Tech CSE Semester III Detailed Syllabus & Scheme",
      type: "SYLLABUS",
      fileUrl: "https://gehu.ac.in/dehradun/academics/curriculum/",
      isOfficial: true,
      requiresAuth: false,
      officialPortalUrl: "https://student.gehu.ac.in",
      publishedAt: new Date("2026-08-01T00:00:00.000Z"),
      status: "AVAILABLE",
      semester: "III",
      campus: "Dehradun",
    },
  ];

  await prisma.document.createMany({
    data: documents,
  });

  // 9. Data Sources
  const dataSources = [
    {
      id: "src-cal",
      name: "GEHU Academic Calendar",
      url: "https://gehu.ac.in/dehradun/academics/calendar/",
      type: "CALENDAR",
      lastScrapedAt: new Date(),
      lastStatus: "SUCCESS",
      recordsCount: 8,
    },
    {
      id: "src-exam",
      name: "GEHU Exam Portal",
      url: "https://gehu.ac.in/dehradun/exam-portal/",
      type: "EXAMS",
      lastScrapedAt: new Date(),
      lastStatus: "SUCCESS",
      recordsCount: 6,
    },
    {
      id: "src-notice",
      name: "GEHU Notice Board",
      url: "https://gehu.ac.in/dehradun/student-area/",
      type: "NOTICES",
      lastScrapedAt: new Date(),
      lastStatus: "SUCCESS",
      recordsCount: 4,
    },
    {
      id: "src-portal",
      name: "GEHU Student ERP Portal",
      url: "https://student.gehu.ac.in",
      type: "STUDENT_PORTAL",
      lastScrapedAt: new Date(),
      lastStatus: "SUCCESS",
      recordsCount: 4,
    },
  ];

  for (const ds of dataSources) {
    const createdDs = await prisma.dataSource.create({
      data: ds,
    });
    await prisma.scrapeJob.create({
      data: {
        sourceId: createdDs.id,
        status: "SUCCESS",
        startedAt: new Date(Date.now() - 3600000),
        finishedAt: new Date(),
        itemsFound: ds.recordsCount,
        itemsNew: ds.recordsCount,
        itemsUpdated: 0,
        logs: `Successfully synchronized and verified ${ds.recordsCount} records.`,
      },
    });
  }

  // 10. Initial Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: "Attendance Warning: Digital Electronics (TEC-301)",
        message:
          "Your current attendance is 72.22%, below the 75% university requirement. You must attend the next 4 consecutive lectures to reach 75%.",
        type: "ATTENDANCE_WARNING",
        linkUrl: "/attendance",
        isRead: false,
      },
      {
        userId: demoUser.id,
        title: "Back-Paper Form Deadline: October 5",
        message:
          "Last date to submit carryover / back-paper registration forms for TCS-201 and TMA-101.",
        type: "BACK_PAPER_DEADLINE",
        linkUrl: "/back-papers",
        isRead: false,
      },
      {
        userId: demoUser.id,
        title: "Upcoming Exam: Data Structures & Algorithms",
        message: "Mid-Semester exam scheduled for October 12, 10:00 AM at Block C Hall 101.",
        type: "EXAM_REMINDER",
        linkUrl: "/exams",
        isRead: false,
      },
    ],
  });

  console.log("Seeding complete! All academic records populated successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
