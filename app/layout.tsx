import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientShell } from "@/components/ClientShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GEHU Student Companion — Attendance, Timetable & Exams",
  description:
    "Intelligent academic dashboard for Graphic Era Hill University. Track attendance, calculate classes you can miss, manage your timetable, exam dates, back papers, and academic calendar updates.",
  keywords: [
    "GEHU",
    "Graphic Era Hill University",
    "attendance planner",
    "attendance calculator",
    "GEHU ERP",
    "timetable",
    "back paper",
    "academic calendar",
  ],
  authors: [{ name: "GEHU Student Companion" }],
  openGraph: {
    title: "GEHU Student Companion — Academic Intelligence & Attendance Planner",
    description:
      "Know exactly how many classes you can miss with mathematical precision. Not affiliated with Graphic Era Hill University ERP.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
