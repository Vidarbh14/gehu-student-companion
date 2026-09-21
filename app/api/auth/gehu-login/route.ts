import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { STUDENT_SESSION_COOKIE } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, captcha, sessionData } = body;

    if (!username || !password || !captcha || !sessionData) {
      return NextResponse.json(
        { success: false, error: "Please enter your Student ID, Password, and Captcha." },
        { status: 400 }
      );
    }

    let parsedSession = { cookies: "", token: "" };
    try {
      parsedSession = JSON.parse(Buffer.from(sessionData, "base64").toString("utf-8"));
    } catch {
      return NextResponse.json(
        { success: false, error: "Session expired. Please refresh the captcha and try again." },
        { status: 400 }
      );
    }

    // Submit authentication to GEHU Student Portal
    const formParams = new URLSearchParams();
    formParams.append("hdnMsg", "GEU");
    formParams.append("checkOnline", "0");
    formParams.append("__RequestVerificationToken", parsedSession.token);
    formParams.append("UserName", username.trim());
    formParams.append("Password", password);
    formParams.append("clientIP", "");
    formParams.append("captcha", captcha.trim());
    formParams.append("HumanTypedFlag", "0");

    const erpResponse = await fetch("https://student.gehu.ac.in/", {
      method: "POST",
      headers: {
        Cookie: parsedSession.cookies,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://student.gehu.ac.in/",
      },
      body: formParams.toString(),
      redirect: "manual",
    });

    const location = erpResponse.headers.get("location") || "";
    const erpHtml = await erpResponse.text();

    // Check if login succeeded (redirect or successful session)
    const isLoginSuccess =
      erpResponse.status === 302 ||
      location.includes("Dashboard") ||
      location.includes("Home") ||
      location.includes("Student") ||
      erpHtml.includes("Logout") ||
      erpHtml.includes("SignOut");

    if (!isLoginSuccess) {
      // Determine error
      let errorMsg = "Invalid Student ID, Password, or Captcha.";
      if (erpHtml.includes("Invalid Captcha") || erpHtml.includes("captcha")) {
        errorMsg = "Incorrect Captcha. Please enter the characters shown in the image.";
      } else if (erpHtml.includes("Invalid User name") || erpHtml.includes("Invalid Password")) {
        errorMsg = "Invalid Student ID or Password.";
      }
      return NextResponse.json({ success: false, error: errorMsg }, { status: 401 });
    }

    // Find or create local user record for this authenticated student
    const cleanId = username.trim().toUpperCase();
    let user = await prisma.user.findFirst({
      where: {
        profile: {
          OR: [{ rollNumber: cleanId }, { universityId: cleanId }],
        },
      },
      include: { profile: true, target: true, subjects: true },
    });

    if (!user) {
      // Create student user record
      user = await prisma.user.create({
        data: {
          email: `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, "")}@student.gehu.ac.in`,
          name: `Student (${cleanId})`,
          profile: {
            create: {
              universityId: cleanId,
              rollNumber: cleanId,
              campus: "Dehradun",
              course: "B.Tech",
              branch: "CSE",
              semester: "III",
              section: "A",
              academicYear: "2026-27",
            },
          },
          target: {
            create: {
              targetPercentage: 75.0,
              safetyBuffer: 2.0,
            },
          },
        },
        include: { profile: true, target: true, subjects: true },
      });
    }

    // Set authenticated session cookie
    const cookieStore = cookies();
    cookieStore.set(STUDENT_SESSION_COOKIE, user.id, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        rollNumber: user.profile?.rollNumber,
        universityId: user.profile?.universityId,
        campus: user.profile?.campus,
        course: user.profile?.course,
        branch: user.profile?.branch,
        semester: user.profile?.semester,
      },
    });
  } catch (err: any) {
    console.error("[GEHU Login API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Authentication service error: " + err.message },
      { status: 500 }
    );
  }
}
