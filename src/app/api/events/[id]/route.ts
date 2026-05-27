import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// 1. GET

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.events.findUnique({
      where: { id: id },
      include: {
        author: true,
        attachments: true, 
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Událost nebyla nalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json(
      { message: "Chyba při načítání detailu události", detail: error.message },
      { status: 500 }
    );
  }
}


// 2. PATCH

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { title, subtitle, text, event_date, address, status, attachments } = body;

    const updatedEvent = await prisma.$transaction(async (tx) => {
      
      if (attachments && Array.isArray(attachments)) {
        await tx.attachments.deleteMany({
          where: { event_id: id },
        });
      }

      return await tx.events.update({
        where: { id: id },
        data: {
          title,
          subtitle,
          text,
          event_date: event_date ? new Date(event_date) : undefined,
          address: address || null, 
          status,
          attachments: attachments && Array.isArray(attachments) ? {
            create: attachments.map((file: { filename: string; url: string }) => ({
              filename: file.filename,
              url: file.url,
            })),
          } : undefined,
        },
        include: {
          attachments: true,
        },
      });
    });

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error("PATCH /api/events/[id] error:", error);
    return NextResponse.json(
      { message: "Chyba při úpravě události", detail: error.message },
      { status: 500 }
    );
  }
}


// 3. DELETE

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.events.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Událost byla úspěšně smazána" });
  } catch (error: any) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json(
      { message: "Chyba při mazání události", detail: error.message },
      { status: 500 }
    );
  }
}