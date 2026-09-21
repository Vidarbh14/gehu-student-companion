import { AcademicCalendarEvent } from "@/types";

export function parseAcademicCalendarPDFText(
  pdfText: string
): AcademicCalendarEvent[] {
  const events: AcademicCalendarEvent[] = [];
  const lines = pdfText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Common pattern in university calendar PDFs:
  // "01 August 2026 : Commencement of Classes for Odd Semester"
  // "02 October 2026 : Mahatma Gandhi Jayanti (Holiday)"
  // "12 Oct - 17 Oct 2026 : Mid-Semester Examination"
  const dateColonRegex =
    /(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+(?:\s*-\s*\d{1,2}\s+[A-Za-z]+)?\s+\d{4})\s*[:\-–]\s*(.+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(dateColonRegex);

    if (match) {
      const dateRangeStr = match[1].trim();
      const title = match[2].trim();

      let type: AcademicCalendarEvent["type"] = "EVENT";
      const lower = title.toLowerCase();
      if (lower.includes("holiday") || lower.includes("jayanti") || lower.includes("diwali")) {
        type = "HOLIDAY";
      } else if (lower.includes("commencement") || lower.includes("start")) {
        type = "SEMESTER_START";
      } else if (lower.includes("end semester") || lower.includes("end sem")) {
        type = "END_SEM";
      } else if (lower.includes("mid semester") || lower.includes("mid sem")) {
        type = "MID_SEM";
      } else if (lower.includes("practical")) {
        type = "PRACTICAL_EXAM";
      }

      events.push({
        id: `pdf-event-${events.length + 1}`,
        title,
        type,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        semester: "ALL",
        campus: "Dehradun",
        source: "GEHU Academic Calendar PDF",
        isOfficial: true,
        description: `Extracted from official PDF: ${title} (${dateRangeStr})`,
      });
    }
  }

  return events;
}
