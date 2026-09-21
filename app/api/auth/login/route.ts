import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { STUDENT_SESSION_COOKIE, createStudentSessionToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      rollNumber,
      name,
      campus,
      course,
      branch,
      semester,
      section,
      targetPercentage,
      safetyBuffer,
      subjects, // optional initial subjects
    } = body;

    if (!rollNumber || !name) {
      return NextResponse.json(
        { success: false, error: "Please enter your Student Roll Number and Name." },
        { status: 400 }
      );
    }

    const cleanRoll = rollNumber.trim().toUpperCase();
    const cleanName = name.trim();

    // Check if student exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { profile: { rollNumber: cleanRoll } },
          { profile: { universityId: cleanRoll } },
          { email: `${cleanRoll.toLowerCase()}@student.gehu.ac.in` },
        ],
      },
      include: {
        profile: true,
        target: true,
        subjects: { include: { attendance: true } },
      },
    });

    if (user) {
      // Update student profile with latest details
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: cleanName },
        include: {
          profile: true,
          target: true,
          subjects: { include: { attendance: true } },
        },
      });

      const updatedProfile = await prisma.studentProfile.update({
        where: { userId: user.id },
        data: {
          campus: campus || user.profile?.campus || "Dehradun",
          course: course || user.profile?.course || "B.Tech",
          branch: branch || user.profile?.branch || "CSE",
          semester: semester || user.profile?.semester || "III",
          section: section || user.profile?.section || "A",
        },
      });
      user.profile = updatedProfile;

      if (targetPercentage || safetyBuffer) {
        const updatedTarget = await prisma.attendanceTarget.update({
          where: { userId: user.id },
          data: {
            targetPercentage: parseFloat(targetPercentage) || 75.0,
            safetyBuffer: parseFloat(safetyBuffer) || 2.0,
          },
        });
        user.target = updatedTarget;
      }
    } else {
      // Create new student record
      user = await prisma.user.create({
        data: {
          email: `${cleanRoll.toLowerCase().replace(/[^a-z0-9]/g, "")}@student.gehu.ac.in`,
          name: cleanName,
          profile: {
            create: {
              universityId: cleanRoll.startsWith("GEHU") ? cleanRoll : `GEHU/2024/${branch || "CSE"}/${cleanRoll}`,
              rollNumber: cleanRoll,
              campus: campus || "Dehradun",
              course: course || "B.Tech",
              branch: branch || "CSE",
              semester: semester || "III",
              section: section || "A",
              academicYear: "2026-27",
            },
          },
          target: {
            create: {
              targetPercentage: parseFloat(targetPercentage) || 75.0,
              safetyBuffer: parseFloat(safetyBuffer) || 2.0,
            },
          },
        },
        include: {
          profile: true,
          target: true,
          subjects: { include: { attendance: true } },
        },
      });

      // Populate subjects if provided, or default starting subjects for their semester
      const initialSubjects = Array.isArray(subjects) && subjects.length > 0
        ? subjects
        : [
            { code: "TCS-301", name: "Data Structures & Algorithms", credits: 4, type: "THEORY", color: "#0c81eb", conducted: 35, attended: 30 },
            { code: "TCS-302", name: "Discrete Mathematics & Graph Theory", credits: 4, type: "THEORY", color: "#8b5cf6", conducted: 32, attended: 26 },
            { code: "TCS-303", name: "Operating Systems Principles", credits: 4, type: "THEORY", color: "#10b981", conducted: 30, attended: 27 },
            { code: "TEC-301", name: "Digital Electronics & Logic Design", credits: 3, type: "THEORY", color: "#ef4444", conducted: 28, attended: 20 },
            { code: "TCS-304", name: "Computer Organization & Architecture", credits: 3, type: "THEORY", color: "#f59e0b", conducted: 28, attended: 22 },
            { code: "PCS-301", name: "Data Structures Laboratory", credits: 1, type: "LAB", color: "#06b6d4", conducted: 10, attended: 9 },
            { code: "PEC-301", name: "Digital Electronics Laboratory", credits: 1, type: "LAB", color: "#14b8a6", conducted: 10, attended: 8 },
            { code: "PCS-303", name: "Operating Systems Laboratory", credits: 1, type: "LAB", color: "#6366f1", conducted: 10, attended: 9 },
          ];

      for (const s of initialSubjects) {
        await prisma.subject.create({
          data: {
            userId: user.id,
            code: s.code,
            name: s.name,
            credits: s.credits || 4,
            type: s.type || "THEORY",
            color: s.color || "#0c81eb",
            attendance: {
              create: {
                conducted: parseInt(s.conducted, 10) || 0,
                attended: parseInt(s.attended, 10) || 0,
                source: "MANUAL",
              },
            },
          },
        });
      }
    }

    // Generate signed, tamper-proof persistent session token
    const sessionToken = createStudentSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      rollNumber: user.profile?.rollNumber || cleanRoll,
      universityId: user.profile?.universityId,
      campus: user.profile?.campus,
      course: user.profile?.course,
      branch: user.profile?.branch,
      semester: user.profile?.semester,
      section: user.profile?.section,
      targetPercentage: user.target?.targetPercentage,
      safetyBuffer: user.target?.safetyBuffer,
    });

    // Set authenticated session cookie (90 days)
    const cookieStore = cookies();
    cookieStore.set(STUDENT_SESSION_COOKIE, sessionToken, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 90, // 90 days
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        profile: user.profile,
        target: user.target,
      },
    });
  } catch (err: any) {
    console.error("[Login API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Login failed: " + err.message },
      { status: 500 }
    );
  }
}
