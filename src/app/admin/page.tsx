import getSession from "@/lib/getSession";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "@/components/AdminClient";

export default async function AdminPage() {
  const session = await getSession();
  const user = session?.user;

  if (!user) redirect("/api/auth/signin?callbackUrl=/admin");

  if (user.role !== "admin") {
    return (
      <main className="mx-auto my-10">
        <p className="text-center">You are not authorized to view this page</p>
      </main>
    );
  }

  const requests = await prisma.approvalRequest.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return <AdminClient requests={requests as any} />;
}
