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

    // 1. Submit authentication to GEHU Student Portal
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

    // 2. Merge cookies from login response for authenticated requests
    const setCookiesHeader = erpResponse.headers.get("set-cookie") || "";
    let combinedCookies = parsedSession.cookies;
    if (setCookiesHeader) {
      const mergedMap: Record<string, string> = {};
      parsedSession.cookies.split(";").forEach((c) => {
        const [k, v] = c.split("=").map((s) => s.trim());
        if (k && v) mergedMap[k] = v;
      });
      setCookiesHeader.split(",").forEach((c) => {
        const pair = c.split(";")[0].trim();
        const [k, v] = pair.split("=").map((s) => s.trim());
        if (k && v) mergedMap[k] = v;
      });
      combinedCookies = Object.entries(mergedMap)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    }

    // 3. Follow redirect to fetch authenticated student portal page
    let studentHtml = erpHtml;
    const redirectUrl = location
      ? location.startsWith("http")
        ? location
        : `https://student.gehu.ac.in${location.startsWith("/") ? "" : "/"}${location}`
      : "https://student.gehu.ac.in/Home/Index";

    try {
      const dashRes = await fetch(redirectUrl, {
        headers: {
          Cookie: combinedCookies,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://student.gehu.ac.in/",
        },
      });
      if (dashRes.ok) {
        studentHtml = await dashRes.text();
      }
    } catch (dashErr) {
      console.warn("[GEHU Login] Could not fetch dashboard page:", dashErr);
    }

    // 4. Parse real student details from ERP HTML
    let studentName = "";
    // Check Welcome banner
    const welcomeMatch = studentHtml.match(/Welcome[,\s]+([A-Za-z\s]{3,40}?)(?:<|&|\n|\r)/i);
    if (welcomeMatch && welcomeMatch[1]?.trim() && !welcomeMatch[1].toLowerCase().includes("user")) {
      studentName = welcomeMatch[1].trim();
    }
    // Check span lblStudentName or lblUserName
    if (!studentName) {
      const nameTagMatch = studentHtml.match(
        /id=["'](?:lblStudentName|lblUserName|spnName)["'][^>]*>([^<]+)<\/span>/i
      );
      if (nameTagMatch && nameTagMatch[1]?.trim()) {
        studentName = nameTagMatch[1].trim();
      }
    }
    // Check user-name class
    if (!studentName) {
      const userClassMatch = studentHtml.match(
        /class=["'][^"']*(?:user-name|profile-name)[^"']*["'][^>]*>([^<]+)</i
      );
      if (userClassMatch && userClassMatch[1]?.trim()) {
        studentName = userClassMatch[1].trim();
      }
    }

    let course = "B.Tech";
    let branch = "CSE";
    let semester = "III";
    let section = "A";

    const branchMatch = studentHtml.match(
      /(?:Branch|Department|Specialization)[\s:</b>]+([A-Za-z0-9\s&]{2,30}?)(?:<|\n)/i
    );
    if (branchMatch && branchMatch[1]) branch = branchMatch[1].trim();

    const courseMatch = studentHtml.match(
      /(?:Course|Programme)[\s:</b>]+([A-Za-z0-9\s.]{2,30}?)(?:<|\n)/i
    );
    if (courseMatch && courseMatch[1]) course = courseMatch[1].trim();

    const semMatch = studentHtml.match(/(?:Semester|Sem)[\s:</b>]+([IVX0-9]+)/i);
    if (semMatch && semMatch[1]) semester = semMatch[1].trim();

    const secMatch = studentHtml.match(/(?:Section|Sec)[\s:</b>]+([A-Z0-9]+)/i);
    if (secMatch && secMatch[1]) section = secMatch[1].trim();

    const cleanId = username.trim().toUpperCase();
    if (!studentName) {
      studentName = `Student (${cleanId})`;
    }

    // 5. Scrape real attendance records if available
    let attendanceHtml = studentHtml;
    if (
      !studentHtml.includes("Delivered") &&
      !studentHtml.includes("Conducted") &&
      !studentHtml.includes("Attended")
    ) {
      try {
        const attRes = await fetch("https://student.gehu.ac.in/StudentAttendance/Index", {
          headers: {
            Cookie: combinedCookies,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Referer: redirectUrl,
          },
        });
        if (attRes.ok) {
          attendanceHtml = await attRes.text();
        }
      } catch (attErr) {
        console.warn("[GEHU Login] Attendance endpoint fetch skipped:", attErr);
      }
    }

    const scrapedSubjects: Array<{
      code: string;
      name: string;
      conducted: number;
      attended: number;
    }> = [];

    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(attendanceHtml)) !== null) {
      const rowContent = rowMatch[1];
      const cols = Array.from(rowContent.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map((m) =>
        m[1].replace(/<[^>]+>/g, "").trim()
      );
      if (cols.length >= 4) {
        const numbers = cols.map((c) => parseInt(c, 10)).filter((n) => !isNaN(n));
        if (numbers.length >= 2) {
          const codeCandidate = cols.find((c) => /^[A-Z]{2,4}-?\d{3}/i.test(c)) || cols[1];
          const nameCandidate = cols.find((c) => c.length > 5 && !/^\d+$/.test(c)) || cols[2];
          const conducted = numbers[numbers.length - 2];
          const attended = numbers[numbers.length - 1];
          if (conducted > 0 && attended <= conducted && codeCandidate && nameCandidate) {
            scrapedSubjects.push({
              code: codeCandidate,
              name: nameCandidate,
              conducted,
              attended,
            });
          }
        }
      }
    }

    // 6. Find or create local user record for this authenticated student
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { profile: { rollNumber: cleanId } },
          { profile: { universityId: cleanId } },
          { email: `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, "")}@student.gehu.ac.in` },
        ],
      },
      include: { profile: true, target: true, subjects: true },
    });

    if (!user) {
      // Create student user record
      user = await prisma.user.create({
        data: {
          email: `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, "")}@student.gehu.ac.in`,
          name: studentName,
          profile: {
            create: {
              universityId: cleanId,
              rollNumber: cleanId,
              campus: "Dehradun",
              course,
              branch,
              semester,
              section,
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
    } else {
      // Update with latest real student name and profile from ERP
      await prisma.user.update({
        where: { id: user.id },
        data: { name: studentName },
      });
      await prisma.studentProfile.update({
        where: { userId: user.id },
        data: {
          course: course || user.profile?.course,
          branch: branch || user.profile?.branch,
          semester: semester || user.profile?.semester,
          section: section || user.profile?.section,
        },
      });
    }

    // 7. If scraped real subjects exist, persist them
    if (scrapedSubjects.length > 0) {
      for (const s of scrapedSubjects) {
        let sub = await prisma.subject.findFirst({
          where: { userId: user.id, code: s.code },
        });

        if (!sub) {
          await prisma.subject.create({
            data: {
              userId: user.id,
              code: s.code,
              name: s.name,
              credits: 4,
              type: "THEORY",
              color: "#0c81eb",
              attendance: {
                create: {
                  conducted: s.conducted,
                  attended: s.attended,
                  source: "OFFICIAL_ERP",
                  notes: "Synced directly from student.gehu.ac.in",
                },
              },
            },
          });
        } else {
          await prisma.attendanceRecord.upsert({
            where: { subjectId: sub.id },
            update: {
              conducted: s.conducted,
              attended: s.attended,
              source: "OFFICIAL_ERP",
              notes: "Updated from student.gehu.ac.in sync",
            },
            create: {
              subjectId: sub.id,
              conducted: s.conducted,
              attended: s.attended,
              source: "OFFICIAL_ERP",
              notes: "Synced from student.gehu.ac.in",
            },
          });
        }
      }
    }

    // 8. Set authenticated session cookie
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
        name: studentName,
        rollNumber: user.profile?.rollNumber,
        universityId: user.profile?.universityId,
        campus: user.profile?.campus,
        course: user.profile?.course,
        branch: user.profile?.branch,
        semester: user.profile?.semester,
        syncedSubjectsCount: scrapedSubjects.length,
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
