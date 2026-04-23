import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Spustíme vše naráz - rychlejší odezva
    const [articles, events, ads] = await Promise.all([
      prisma.articles.findMany({ 
        where: { status: "PUBLISHED" }, // Chceme jen veřejné
        orderBy: { created_at: "desc" },
        take: 15 // Zatím stačí prvních 15
      }),
      prisma.events.findMany({ 
        where: { status: "PUBLISHED" },
        orderBy: { created_at: "desc" },
        take: 15
      }),
      prisma.ads.findMany({ 
        where: { status: "PUBLISHED" },
        orderBy: { created_at: "desc" },
        take: 15
      }),
    ]);

    const combined = [
      ...articles.map(a => ({ ...a, type: "ARTICLE" })),
      ...events.map(e => ({ ...e, type: "EVENT" })),
      ...ads.map(ad => ({ ...ad, type: "AD" })),
    ];

    // Seřazení od nejnovějšího
    combined.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json(combined);
  } catch (error) {
    console.error("GET /api/feed error:", error);
    return NextResponse.json(
      { message: "Chyba při načítání nástěnky" },
      { status: 500 }
    );
  }
}