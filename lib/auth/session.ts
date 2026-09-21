import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export const STUDENT_SESSION_COOKIE = "gehu_student_session";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Retrieves the currently logged in student from session cookies or headers.
 * Returns null if the user is unauthenticated.
 */
export async function getAuthenticatedStudent(): Promise<any | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(STUDENT_SESSION_COOKIE);
    const userId = sessionCookie?.value;

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        target: true,
        subjects: {
          include: {
            attendance: true,
          },
        },
        timetable: {
          include: {
            subject: true,
          },
        },
      },
    });

    return user;
  } catch (err) {
    console.error("[Session] Error fetching authenticated student:", err);
    return null;
  }
}
