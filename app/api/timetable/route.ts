import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

import { getAuthenticatedStudent } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedStudent();

    if (!user) {
      return NextResponse.json({ error: "Please log in first.", unauthenticated: true }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      timetable: user.timetable,
      subjects: user.subjects,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch timetable: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, slotId, subjectId, dayOfWeek, startTime, endTime, room, faculty, classType } =
      body;

    const user = await getAuthenticatedStudent();

    if (!user) {
      return NextResponse.json({ error: "Please log in first.", unauthenticated: true }, { status: 401 });
    }

    if (action === "delete" && slotId) {
      await prisma.timetableEntry.delete({
        where: { id: slotId },
      });
      return NextResponse.json({ success: true, message: "Slot deleted." });
    }

    if (action === "create") {
      const newSlot = await prisma.timetableEntry.create({
        data: {
          userId: user.id,
          subjectId,
          dayOfWeek,
          startTime: startTime || "09:00",
          endTime: endTime || "10:00",
          room: room || "Room 101",
          faculty: faculty || "Faculty",
          classType: classType || "THEORY",
        },
        include: { subject: true },
      });
      return NextResponse.json({ success: true, slot: newSlot });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to modify timetable: " + err.message },
      { status: 500 }
    );
  }
}
