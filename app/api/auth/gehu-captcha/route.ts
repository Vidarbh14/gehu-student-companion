import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Initialize session with student portal
    const initRes = await fetch("https://student.gehu.ac.in/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    const setCookies = initRes.headers.get("set-cookie") || "";
    const cookieHeader = setCookies
      .split(",")
      .map((c) => c.split(";")[0].trim())
      .join("; ");

    const initHtml = await initRes.text();
    const tokenMatch = initHtml.match(
      /name="__RequestVerificationToken" type="hidden" value="([^"]+)"/
    );
    const verificationToken = tokenMatch ? tokenMatch[1] : "";

    // 2. Request live captcha image
    const captchaRes = await fetch(
      "https://student.gehu.ac.in/Account/showrefreshcaptchaImage",
      {
        method: "POST",
        headers: {
          Cookie: cookieHeader,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
          Referer: "https://student.gehu.ac.in/",
        },
        cache: "no-store",
      }
    );

    if (!captchaRes.ok) {
      throw new Error(`Captcha endpoint responded with status ${captchaRes.status}`);
    }

    const json = await captchaRes.json();
    if (!Array.isArray(json)) {
      throw new Error("Invalid captcha response format");
    }

    const buffer = Buffer.from(json);
    const captchaDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;

    // Package session data to return to client
    const sessionData = Buffer.from(
      JSON.stringify({
        cookies: cookieHeader,
        token: verificationToken,
      })
    ).toString("base64");

    return NextResponse.json({
      success: true,
      captchaDataUrl,
      sessionData,
      source: "https://student.gehu.ac.in",
    });
  } catch (err: any) {
    console.error("[Captcha API] Failed to fetch live captcha:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to GEHU student portal captcha service: " + err.message,
      },
      { status: 500 }
    );
  }
}
