import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import getSession from "@/lib/getSession";
import prisma from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const session = await getSession();

    if (!session?.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const prompt = `
You are an assistant in a leave management app. 
If the user's message is a request for leave or work-from-home, respond with:

{
  "intent": "createApproval",
  "payload": {
    "type": "Leave" or "Work From Home",
    "reason": "short summary"
  },
  "reply": " Your request has been submitted."
}

If it's a general question, respond with:

{
  "intent": "chat",
  "reply": "Here's some help: ..."
}

User: "${message}"
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const rawResponse = completion.choices[0].message.content ?? "";

    try {
      const parsed = JSON.parse(rawResponse);

      if (parsed.intent === "createApproval" && parsed.payload) {
        const { type, reason } = parsed.payload;

        if (!type || !reason) {
          return NextResponse.json({
            intent: "chat",
            reply: " I couldn't understand your request clearly. Try again?",
          });
        }

        await prisma.approvalRequest.create({
          data: {
            userId: session.user.id,
            type,
            reason,
          },
        });
      }

      return NextResponse.json(parsed);
    } catch (jsonErr) {
      console.error("Failed to parse OpenAI response:", rawResponse);
      return NextResponse.json({
        intent: "chat",
        reply: " Sorry, I couldn’t understand that. Can you rephrase?",
      });
    }
  } catch (err) {
    console.error("Chatbot API error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
