import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  // Fully validate session
  const userId = session?.user?.id;
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { type, reason } = await req.json();

  if (!type || !reason) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  await prisma.approvalRequest.create({
    data: {
      userId, // now guaranteed to be a string
      type,
      reason,
    },
  });

  return NextResponse.json({ success: true });
}
