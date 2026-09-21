import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthenticatedStudent } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedStudent();

    if (!user) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch notifications: " + err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { notificationId, markAll } = body;

    const user = await getAuthenticatedStudent();

    if (!user) {
      return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
    }

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "All marked as read." });
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "Marked as read." });
    }

    return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update notification: " + err.message },
      { status: 500 }
    );
  }
}
