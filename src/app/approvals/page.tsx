// src/app/approvals/page.tsx
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ApprovalsClient from "@/components/ApprovalsClient";

export default async function ApprovalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const approvals = await prisma.approvalRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Convert Dates to strings
  const safeApprovals = approvals.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  return (
    <ApprovalsClient
      approvals={safeApprovals}
      user={{
        id: session.user.id,
        name: session.user.name ?? undefined,
        email: session.user.email!,
      }}
    />
  );
}
