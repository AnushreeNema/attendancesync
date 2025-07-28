import prisma from "@/lib/prisma";
import getSession from "@/lib/getSession";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { comment } = await req.json();

    await prisma.approvalRequest.update({
      where: { id: params.id },
      data: {
        status: "Approved",
        comment: comment || null,
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    return new NextResponse("Error updating approval", { status: 500 });
  }
}
