import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // 1. Kontrola přihlášení (Požadavek: Zákaz interakce bez přihlášení)
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { message: "Pro vytvoření události se musíte přihlásit." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 2. Vytvoření události
    const newEvent = await prisma.events.create({
      data: {
        title: body.title,
        subtitle: body.subtitle || null,
        text: body.text,
        cover_image: body.cover_image || null,
        event_date: new Date(body.event_date),
        address: body.address,
        
        // Sjednocení statusu (DRAFT/PUBLISHED)
        status: body.status?.toUpperCase() || "DRAFT",
        
        // Změna: ID bereme bezpečně ze session
        author_id: session.userId,
        
        // Pokud je status PUBLISHED, nastavíme datum vydání na teď
        date_of_release: body.status?.toUpperCase() === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { message: "Nepodařilo se vytvořit událost" },
      { status: 500 }
    );
  }
}