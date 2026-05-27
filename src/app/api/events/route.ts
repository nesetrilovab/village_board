import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";


// 1. GET

export async function GET() {
  try {
    const events = await prisma.events.findMany({
      include: {
        author: true,
        attachments: true, 
      },
      orderBy: {
        event_date: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { message: "Error while loading events", detail: error.message },
      { status: 500 }
    );
  }
}


// 2. POST

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { message: "To create an event, you have to be logged in." },
        { status: 401 }
      );
    }

    const body = await request.json();

   
    const { title, subtitle, text, event_date, address, status, attachments } = body;

    const newEvent = await prisma.events.create({
      data: {
        title,
        subtitle: subtitle || null,
        text, 
        event_date: new Date(event_date),
        address: address || null,
        status: status?.toUpperCase() || "DRAFT",
        date_of_release: status?.toUpperCase() === "PUBLISHED" ? new Date() : null,
        
        author: {
          connect: { id: session.userId }
        },

        attachments: attachments && Array.isArray(attachments) ? {
          create: attachments.map((file: { filename: string; url: string }) => ({
            filename: file.filename,
            url: file.url,
          })),
        } : undefined,
      },
      include: {
        attachments: true, 
      }
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { message: "Could not create event", detail: error.message },
      { status: 500 }
    );
  }
}