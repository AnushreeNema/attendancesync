"use client";

import { useState } from "react";
import { ApprovalStatus } from "@prisma/client";

type Approval = {
  id: string;
  type: string;
  reason: string;
  status: ApprovalStatus;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  approvals: Approval[];
  user: {
    id: string;
    name?: string;
    email: string;
  };
};

export default function ApprovalsClient({ approvals, user }: Props) {
  const [type, setType] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitRequest = async () => {
    setSubmitting(true);
    await fetch("/api/approvals", {
      method: "POST",
      body: JSON.stringify({ type, reason }),
    });
    setType("");
    setReason("");
    setSubmitting(false);
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Your Approval Requests</h1>

      <div className="space-y-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded border p-2"
        >
          <option value="">Select Type</option>
          <option value="Leave">Leave</option>
          <option value="Work From Home">Work From Home</option>
        </select>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason..."
          className="w-full rounded border p-2"
        />

        <button
          onClick={submitRequest}
          className="rounded bg-blue-600 px-4 py-2 text-white"
          disabled={submitting || !type || !reason}
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold">Past Requests</h2>
        <ul className="mt-2 space-y-2">
          {approvals.map((req) => (
            <li key={req.id} className="flex flex-col rounded border p-3">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{req.type}</div>
                  <div className="text-sm text-gray-600">{req.reason}</div>
                  {req.comment && (
                    <div className="text-xs italic text-gray-500">
                      Admin Comment: {req.comment}
                    </div>
                  )}
                </div>
                <span
                  className={`text-sm font-bold ${
                    req.status === "Approved"
                      ? "text-green-600"
                      : req.status === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  {req.status}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Submitted on: {new Date(req.createdAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
