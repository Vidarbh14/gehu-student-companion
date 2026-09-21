import { describe, it, expect } from "vitest";
import { parseAttendanceCSV, parseTimetableCSV } from "./csvParser";
import { parseAcademicJSON } from "./jsonParser";
import { processExtractedOCRText } from "./ocrParser";

describe("CSV Parsers", () => {
  it("parses attendance CSV correctly", () => {
    const csv = `Subject Code,Subject Name,Conducted,Attended
TCS-301,Data Structures,42,36
TCS-302,Mathematics,40,31`;

    const rows = parseAttendanceCSV(csv);
    expect(rows.length).toBe(2);
    expect(rows[0].subjectCode).toBe("TCS-301");
    expect(rows[0].conducted).toBe(42);
    expect(rows[0].attended).toBe(36);
  });

  it("parses timetable CSV correctly", () => {
    const csv = `Day,Start,End,SubjectCode,SubjectName,Room,Faculty,Type
MONDAY,09:00,10:00,TCS-301,Data Structures,Room 204,Dr. Sharma,THEORY
MONDAY,14:00,16:00,PCS-301,DSA Lab,Lab 4,Er. Rawat,LAB`;

    const rows = parseTimetableCSV(csv);
    expect(rows.length).toBe(2);
    expect(rows[0].dayOfWeek).toBe("MONDAY");
    expect(rows[0].subjectCode).toBe("TCS-301");
    expect(rows[1].classType).toBe("LAB");
  });
});

describe("JSON Academic Parser", () => {
  it("validates and parses valid academic JSON", () => {
    const jsonStr = JSON.stringify({
      attendance: [
        {
          subjectCode: "TCS-301",
          subjectName: "Data Structures",
          conducted: 42,
          attended: 36,
        },
      ],
      timetable: [
        {
          dayOfWeek: "MONDAY",
          startTime: "09:00",
          endTime: "10:00",
          subjectCode: "TCS-301",
          subjectName: "Data Structures",
        },
      ],
    });

    const parsed = parseAcademicJSON(jsonStr);
    expect(parsed.success).toBe(true);
    expect(parsed.attendance.length).toBe(1);
    expect(parsed.timetable.length).toBe(1);
  });
});

describe("OCR Parser", () => {
  it("extracts structured subject attendance from OCR text", () => {
    const ocrSample = `Graphic Era Hill University ERP
TCS-301 Data Structures 36 / 42 85.71%
TCS-302 Mathematics 31 / 40 77.50%`;

    const result = processExtractedOCRText(ocrSample);
    expect(result.success).toBe(true);
    expect(result.requiresUserConfirmation).toBe(true);
    expect(result.extractedRecords.length).toBeGreaterThanOrEqual(2);
    expect(result.extractedRecords[0].subjectCode).toBe("TCS-301");
    expect(result.extractedRecords[0].attended).toBe(36);
    expect(result.extractedRecords[0].conducted).toBe(42);
  });
});
