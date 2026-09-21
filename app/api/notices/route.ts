import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q")?.toLowerCase();

    // Fetch user profile for personalization
    const user = await prisma.user.findFirst({
      where: { email: "demo@gehu.ac.in" },
      include: { profile: true },
    });

    const userProfile = user?.profile;

    const whereClause: any = {};
    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    const notices = await prisma.notice.findMany({
      where: whereClause,
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    });

    // Compute profile matching and search filter
    const enriched = notices
      .map((n) => {
        let isProfileMatched = false;
        if (userProfile) {
          const matchCampus =
            !n.campus || n.campus === "ALL" || n.campus === userProfile.campus;
          const matchCourse =
            !n.course || n.course === "ALL" || n.course === userProfile.course;
          const matchBranch =
            !n.branch || n.branch === "ALL" || n.branch === userProfile.branch;
          const matchSem =
            !n.semester ||
            n.semester === "ALL" ||
            n.semester === userProfile.semester;

          isProfileMatched = matchCampus && matchCourse && matchBranch && matchSem;
        }

        return {
          ...n,
          isProfileMatched,
        };
      })
      .filter((n) => {
        if (!query) return true;
        return (
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query)
        );
      });

    return NextResponse.json({
      success: true,
      notices: enriched,
      totalCount: enriched.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch notices: " + err.message },
      { status: 500 }
    );
  }
}
