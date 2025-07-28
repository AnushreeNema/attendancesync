"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, MessageCircle } from "lucide-react";
import CalendarView from "@/components/CalendarView";

type AttendanceStatus = "Present" | "Not Present" | "Holiday" | "Upcoming";

type DayEntry = {
  date: Date;
  status: AttendanceStatus;
};

type Props = {
  session: any;
  users: any[];
  attendance: DayEntry[];
  monthDate: Date;
};

export default function HomeClient({
  session,
  users,
  attendance,
  monthDate,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const input = message.trim();
    if (!input) return;

    setChatHistory((prev) => [...prev, `You: ${input}`]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setChatHistory((prev) => [...prev, `AI: ${data.reply}`]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setChatHistory((prev) => [
        ...prev,
        "AI:  Something went wrong. Try again later.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Sidebar */}
      {menuOpen && (
        <aside className="w-64 bg-gray-100 p-4 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold">Menu</h2>
            <button onClick={() => setMenuOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-4">
            <Link href="/calendar" className="hover:underline">
              Calendar
            </Link>
            <Link href="/approvals" className="hover:underline">
              Approvals
            </Link>
            <Link href="/attendance" className="hover:underline">
              Attendance
            </Link>
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-10">
        {!menuOpen && (
          <button onClick={() => setMenuOpen(true)} className="mb-4">
            <Menu className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-center text-4xl font-bold">AttendanceSync</h1>
        <p className="mt-4 text-center text-lg">
          Welcome, <strong>{session.user.name || session.user.email}</strong>!
        </p>

        {/* Embedded Calendar */}
        <CalendarView data={attendance} monthDate={monthDate} />
      </main>

      {/* Chatbot Floating Button + Popup */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}

        {chatOpen && (
          <div className="flex h-96 w-80 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
            <div className="mb-2 flex items-center justify-between border-b pb-2">
              <h3 className="font-bold">Chat</h3>
              <button onClick={() => setChatOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-2 flex-1 space-y-2 overflow-y-auto text-sm text-gray-700">
              {chatHistory.length === 0 ? (
                <p className="mt-10 text-center text-xs italic text-gray-400">
                  how can I help today...
                </p>
              ) : (
                chatHistory.map((msg, i) => <p key={i}>{msg}</p>)
              )}
              {loading && <p className="italic text-blue-500">typing...</p>}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="mt-auto flex"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-l-md border border-gray-300 px-2 py-1 text-sm"
              />
              <button
                type="submit"
                className="rounded-r-md bg-blue-600 px-3 py-1 text-sm text-white"
                disabled={loading}
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
