import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isAfter,
} from "date-fns";
import HomeClient from "@/components/HomeClient"; // correct props

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const users = await prisma.user.findMany();

  // Attendance logic
  const now = new Date();
  const monthDate = now;
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

    let status: "Present" | "Not Present" | "Holiday" | "Upcoming" =
      "Not Present";

    if (isAfter(date, now)) {
      status = "Upcoming";
    } else if (dayName === "Saturday" || dayName === "Sunday") {
      status = "Holiday";
    } else if (loginDates.has(dateStr)) {
      status = "Present";
    }

    return { date, status };
  });

  return (
    <HomeClient
      session={session}
      users={users}
      attendance={attendance}
      monthDate={monthDate}
    />
  );
}
