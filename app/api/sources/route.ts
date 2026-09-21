import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dataSources = await prisma.dataSource.findMany({
      include: {
        scrapeJobs: {
          orderBy: { startedAt: "desc" },
          take: 5,
        },
      },
    });

    const recentJobs = await prisma.scrapeJob.findMany({
      include: { dataSource: true },
      orderBy: { startedAt: "desc" },
      take: 15,
    });

    return NextResponse.json({
      success: true,
      sources: dataSources,
      recentJobs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch source health: " + err.message },
      { status: 500 }
    );
  }
}
