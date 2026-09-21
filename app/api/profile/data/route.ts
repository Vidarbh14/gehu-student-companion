import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "demo@gehu.ac.in" },
      include: {
        profile: true,
        target: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        target: user.target,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch profile: " + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { name, campus, course, branch, semester, section, rollNumber, targetPercentage, safetyBuffer } =
      body;

    const user = await prisma.user.findFirst({
      where: { email: "demo@gehu.ac.in" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        campus: campus || "Dehradun",
        course: course || "B.Tech",
        branch: branch || "CSE",
        semester: semester || "III",
        section: section || "A",
        rollNumber: rollNumber || undefined,
      },
      create: {
        userId: user.id,
        universityId: "GEHU/2024/CSE/1042",
        campus: campus || "Dehradun",
        course: course || "B.Tech",
        branch: branch || "CSE",
        semester: semester || "III",
        section: section || "A",
        rollNumber: rollNumber || undefined,
      },
    });

    if (targetPercentage || safetyBuffer) {
      await prisma.attendanceTarget.upsert({
        where: { userId: user.id },
        update: {
          targetPercentage: parseFloat(targetPercentage) || 75.0,
          safetyBuffer: parseFloat(safetyBuffer) || 2.0,
        },
        create: {
          userId: user.id,
          targetPercentage: parseFloat(targetPercentage) || 75.0,
          safetyBuffer: parseFloat(safetyBuffer) || 2.0,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully." });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update profile: " + err.message },
      { status: 500 }
    );
  }
}

/**
 * Section 48: "Delete My Data" feature.
 * Purges all student attendance, timetable entries, and profile records.
 */
export async function DELETE() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "demo@gehu.ac.in" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Delete personal records
    await prisma.notification.deleteMany({ where: { userId: user.id } });
    await prisma.timetableEntry.deleteMany({ where: { userId: user.id } });
    await prisma.attendanceRecord.deleteMany({
      where: { subject: { userId: user.id } },
    });
    await prisma.subject.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({
      success: true,
      message:
        "All your personal attendance records and timetable data have been completely purged from the local database.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Data deletion failed: " + err.message },
      { status: 500 }
    );
  }
}
