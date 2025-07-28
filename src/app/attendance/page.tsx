import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  isAfter,
} from "date-fns";
import AttendanceClient from "@/components/AttendanceClient";

type AttendanceStatus = "Present" | "Not Present" | "Holiday" | "Upcoming";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const now = new Date();
  const monthDate = searchParams.month
    ? parseISO(searchParams.month + "-01")
    : now;

  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);

  const logins = await prisma.login.findMany({
    where: { userId: session.user.id },
    select: { date: true },
  });

  const loginDates = new Set(
    logins.map((entry) => format(new Date(entry.date), "yyyy-MM-dd")),
  );

  const allDays = eachDayOfInterval({ start, end });

  const attendance = allDays.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayName = format(date, "EEEE");

    let status: AttendanceStatus = "Not Present";

    if (isAfter(date, now)) {
      status = "Upcoming";
    } else if (dayName === "Saturday" || dayName === "Sunday") {
      status = "Holiday";
    } else if (loginDates.has(dateStr)) {
      status = "Present";
    }

    return { date: dateStr, day: dayName, status };
  });

  return (
    <AttendanceClient
      attendance={attendance}
      currentMonth={format(monthDate, "yyyy-MM")}
    />
  );
}
