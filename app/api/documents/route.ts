import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      documents,
      portalNotice:
        "Official examination admit cards and fee receipts require secure university authentication. Use the verified links to log in to student.gehu.ac.in.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch documents: " + err.message },
      { status: 500 }
    );
  }
}
