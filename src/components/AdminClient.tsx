"use client";

import { useState, useEffect } from "react";
import { ApprovalStatus } from "@prisma/client";

type Request = {
  id: string;
  status: ApprovalStatus;
  type: string;
  reason: string;
  comment: string | null; // include comment
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
};

export default function AdminClient({ requests }: { requests: Request[] }) {
  const [approvalStatus, setApprovalStatus] = useState<
    Record<string, ApprovalStatus>
  >({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submittedComments, setSubmittedComments] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const initialStatus = Object.fromEntries(
      requests.map((req) => [req.id, req.status]),
    );
    const initialSubmittedComments = Object.fromEntries(
      requests.map((req) => [req.id, req.comment ?? ""]),
    );
    setApprovalStatus(initialStatus);
    setSubmittedComments(initialSubmittedComments);
  }, [requests]);

  const handleAction = async (id: string, action: ApprovalStatus) => {
    const endpoint = `/admin/${action === "Approved" ? "approve" : "reject"}/${id}`;
    const res = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ comment: comments[id] || "" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      setApprovalStatus((prev) => ({ ...prev, [id]: action }));
      setSubmittedComments((prev) => ({ ...prev, [id]: comments[id] || "" }));
      setComments((prev) => ({ ...prev, [id]: "" }));
    } else {
      console.error("Failed request", res.statusText);
      alert(" Failed to update approval.");
    }
  };

  return (
    <div className="mx-auto my-10 max-w-3xl space-y-6 px-4">
      <h1 className="text-center text-2xl font-bold">Approval Requests</h1>

      {requests.map((req) => (
        <div
          key={req.id}
          className="flex flex-col gap-2 rounded border p-4 shadow"
        >
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{req.user.name || req.user.email}</p>
              <p className="text-sm text-gray-600">
                {req.type} — {req.reason}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(req.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {approvalStatus[req.id] === "Pending" ? (
                <>
                  <button
                    onClick={() => handleAction(req.id, "Approved")}
                    className="rounded bg-green-600 px-2 py-1 text-sm text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "Rejected")}
                    className="rounded bg-red-600 px-2 py-1 text-sm text-white"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <span
                  className={`text-sm font-bold ${
                    approvalStatus[req.id] === "Approved"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {approvalStatus[req.id]} ✔️
                </span>
              )}
            </div>
          </div>

          {approvalStatus[req.id] === "Pending" ? (
            <input
              type="text"
              placeholder="Add a comment (optional)"
              value={comments[req.id] || ""}
              onChange={(e) =>
                setComments((prev) => ({ ...prev, [req.id]: e.target.value }))
              }
              className="mt-2 w-full rounded border px-2 py-1 text-sm"
            />
          ) : submittedComments[req.id] ? (
            <p className="mt-1 text-sm italic text-gray-500">
              Comment: {submittedComments[req.id]}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
