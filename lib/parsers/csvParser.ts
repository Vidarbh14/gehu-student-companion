import { DayOfWeek } from "@/types";

export interface ParsedTimetableRow {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  room?: string;
  faculty?: string;
  classType?: "THEORY" | "LAB";
}

export interface ParsedAttendanceRow {
  subjectCode: string;
  subjectName: string;
  attended: number;
  conducted: number;
}

export function parseTimetableCSV(csvContent: string): ParsedTimetableRow[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: ParsedTimetableRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    if (cols.length < 4) continue;

    const dayRaw = (cols[0] || "MONDAY").toUpperCase();
    const validDay: DayOfWeek = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ].includes(dayRaw)
      ? (dayRaw as DayOfWeek)
      : "MONDAY";

    rows.push({
      dayOfWeek: validDay,
      startTime: cols[1] || "09:00",
      endTime: cols[2] || "10:00",
      subjectCode: cols[3] || "TCS-101",
      subjectName: cols[4] || cols[3] || "Subject",
      room: cols[5] || "Room 101",
      faculty: cols[6] || "",
      classType: (cols[7] || "").toUpperCase().includes("LAB") ? "LAB" : "THEORY",
    });
  }

  return rows;
}

export function parseAttendanceCSV(csvContent: string): ParsedAttendanceRow[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const rows: ParsedAttendanceRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    if (cols.length < 3) continue;

    const code = cols[0];
    const name = cols[1];
    const conducted = parseInt(cols[2], 10) || 0;
    const attended = parseInt(cols[3] || cols[2], 10) || 0;

    if (code && conducted >= 0) {
      rows.push({
        subjectCode: code,
        subjectName: name || code,
        conducted,
        attended: Math.min(attended, conducted),
      });
    }
  }

  return rows;
}
