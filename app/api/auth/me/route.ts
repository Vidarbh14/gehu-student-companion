import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAuthenticatedStudent,
  createStudentSessionToken,
  STUDENT_SESSION_COOKIE,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const student = await getAuthenticatedStudent();

    if (!student) {
      return NextResponse.json({ authenticated: false });
    }

    const token = createStudentSessionToken({
      id: student.id,
      name: student.name,
      email: student.email,
      rollNumber: student.profile?.rollNumber || "24150021",
      universityId: student.profile?.universityId,
      campus: student.profile?.campus,
      course: student.profile?.course,
      branch: student.profile?.branch,
      semester: student.profile?.semester,
      section: student.profile?.section,
      targetPercentage: student.target?.targetPercentage,
      safetyBuffer: student.target?.safetyBuffer,
    });

    try {
      const cookieStore = cookies();
      cookieStore.set(STUDENT_SESSION_COOKIE, token, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 90, // 90 days
        sameSite: "lax",
      });
    } catch {
      // Ignore if headers already sent
    }

    return NextResponse.json({
      authenticated: true,
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        profile: student.profile,
        target: student.target,
        subjectsCount: student.subjects?.length ?? 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
