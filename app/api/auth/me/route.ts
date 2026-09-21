import { NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const student = await getAuthenticatedStudent();

    if (!student) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
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
