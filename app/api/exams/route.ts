import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { date: "asc" },
    });

    const regularExams = exams.filter((e) => !e.isBackPaper);
    const backPaperExams = exams.filter((e) => e.isBackPaper);

    return NextResponse.json({
      success: true,
      allExams: exams,
      regularExams,
      backPaperExams,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch exams: " + err.message },
      { status: 500 }
    );
  }
}
