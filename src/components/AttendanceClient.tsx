"use client";

import { useRouter } from "next/navigation";
import { format, parseISO, addMonths, subMonths } from "date-fns";

type Entry = {
  date: string;
  day: string;
  status: "Present" | "Not Present" | "Holiday" | "Upcoming";
};

export default function AttendanceClient({
  attendance,
  currentMonth,
}: {
  attendance: Entry[];
  currentMonth: string;
}) {
  const router = useRouter();
  const monthDate = parseISO(currentMonth + "-01");

  const bgColors: Record<Entry["status"], string> = {
    Present: "bg-green-100/60 text-green-700 border border-green-300",
    "Not Present": "bg-red-100/60 text-red-700 border border-red-300",
    Holiday: "bg-gray-100/60 text-gray-600 border border-gray-300",
    Upcoming: "bg-gray-50/60 text-gray-400 border border-gray-200",
  };

  const goToMonth = (offset: number) => {
    const newDate =
      offset > 0 ? addMonths(monthDate, offset) : subMonths(monthDate, -offset);
    const newMonth = format(newDate, "yyyy-MM");
    router.push(`/attendance?month=${newMonth}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => goToMonth(-1)}
          className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
        >
          ← Previous
        </button>
        <h1 className="text-2xl font-bold">
          Attendance - {format(monthDate, "MMMM yyyy")}
        </h1>
        <button
          onClick={() => goToMonth(1)}
          className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {attendance.map((entry) => (
          <div
            key={entry.date}
            className={`rounded-xl p-4 shadow-sm backdrop-blur-sm ${bgColors[entry.status]}`}
          >
            <p className="text-sm font-medium">{entry.day}</p>
            <p className="text-lg font-semibold">{entry.date}</p>
            <p className="mt-2 text-base">{entry.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
