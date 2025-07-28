import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  isSameDay,
  getDay,
  isAfter,
} from "date-fns";
import React from "react";
import classNames from "classnames";

type AttendanceStatus = "Present" | "Not Present" | "Holiday" | "Upcoming";

export default async function CalendarPage({
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
  const allDays = eachDayOfInterval({ start, end });

  const logins = await prisma.login.findMany({
    where: { userId: session.user.id },
    select: { date: true },
  });

  const loginDates = new Set(
    logins.map((entry) => format(new Date(entry.date), "yyyy-MM-dd")),
  );

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

    return { date, status };
  });

  const firstDayOfWeek = getDay(start);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">
        Attendance for {format(monthDate, "MMMM yyyy")}
      </h1>

      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div
        className="mt-2 grid grid-cols-7 gap-2 text-center"
        style={{ gridAutoRows: "80px" }}
      >
        {Array(firstDayOfWeek)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

        {attendance.map(({ date, status }) => (
          <div
            key={date.toISOString()}
            className={classNames(
              "flex flex-col items-center justify-center rounded-lg border p-2",
              {
                "bg-green-100 text-green-700": status === "Present",
                "bg-red-100 text-red-700": status === "Not Present",
                "bg-gray-200 text-gray-600": status === "Holiday",
                "bg-yellow-100 text-yellow-700": status === "Upcoming",
              },
            )}
          >
            <div className="font-semibold">{format(date, "d")}</div>
            <div className="text-xs">{status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
