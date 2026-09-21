import { prisma } from "../db/prisma";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type:
    | "ATTENDANCE_WARNING"
    | "EXAM_REMINDER"
    | "BACK_PAPER_DEADLINE"
    | "ADMIT_CARD"
    | "NOTICE"
    | "SYSTEM";
  linkUrl?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        linkUrl: params.linkUrl,
      },
    });
  } catch (err) {
    console.error("[NotificationService] Error creating notification:", err);
    return null;
  }
}

export async function getUserNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function markNotificationAsRead(id: string) {
  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
