"use client";

import { format, getDay } from "date-fns";
import classNames from "classnames";

type AttendanceStatus = "Present" | "Not Present" | "Holiday" | "Upcoming";

interface DayEntry {
  date: Date;
  status: AttendanceStatus;
}

export default function CalendarView({
  data,
  monthDate,
}: {
  data: DayEntry[];
  monthDate: Date;
}) {
  const firstDayOfWeek = getDay(
    new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
  );

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-center text-xl font-bold">
        {format(monthDate, "MMMM yyyy")}
      </h2>

      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div
        className="mt-2 grid grid-cols-7 gap-2"
        style={{ gridAutoRows: "80px" }}
      >
        {Array(firstDayOfWeek)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

        {data.map(({ date, status }) => (
          <div
            key={date.toISOString()}
            className={classNames(
              "flex flex-col items-center justify-center rounded-lg border p-2 text-center",
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
