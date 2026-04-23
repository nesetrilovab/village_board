import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Ověření přihlášení (Požadavek: Zákaz interakce bez přihlášení)
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { message: "Pro vytvoření inzerátu se musíte přihlásit." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 2. Vytvoření inzerátu v DB
    const ad = await prisma.ads.create({
      data: {
        ad_type: body.ad_type?.toUpperCase() || "ITEM",
        title: body.title,
        item_name: body.item_name || null,
        picture: body.picture || null,
        price: body.price ? Number(body.price) : null,
        description: body.description,
        location: body.location || null,
        
        // Status bereme z body (pro drafty), nebo defaultně DRAFT
        status: body.status?.toUpperCase() || "DRAFT",
        
        // ZDE JE TA ZMĚNA: ID bereme ze session
        author_id: session.userId, 
        
        // Pokud publikujeme, nastavíme aktuální datum, jinak null (u draftu)
        date_of_release: body.status === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error("POST /api/ads error:", error);
    return NextResponse.json(
      { message: "Chyba při vytváření inzerátu" },
      { status: 500 }
    );
  }
}