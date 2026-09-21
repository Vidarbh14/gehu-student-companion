import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { STUDENT_SESSION_COOKIE } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete(STUDENT_SESSION_COOKIE);

  return NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });
}
