import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth"; // Naimportujeme naši novou pomocnou funkci

export async function GET() {
  try {
    // Pro GET (veřejný feed) chceme načíst vše, co je PUBLISHED
    // Později to můžeš upravit tak, aby ADMIN viděl vše i s drafty
    const articles = await prisma.articles.findMany({
      where: {
        status: "PUBLISHED", // Zobrazujeme jen publikované věci
      },
      include: { 
        attachments: true,
        author: true // Hodí se pro zobrazení jména autora u článku
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(articles);
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json({ message: "Chyba při načítání" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Ověření session (POŽADAVEK: Bez přihlášení zákaz interakce)
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Pro tuto akci se musíte přihlásit" }, { status: 401 });
    }

    const body = await req.json();

    // 2. Vytvoření článku
    const article = await prisma.articles.create({
      data: {
        title: body.title,
        subtitle: body.subtitle || null,
        text: body.text,
        cover_image: body.cover_image || null,
        
        // POŽADAVEK: Schopnost vytvořit DRAFT
        // Pokud z frontendu nepřijde status, použijeme DRAFT
        status: body.status || "DRAFT", 
        
        // ID bereme bezpečně ze session tokenu, ne z těla požadavku (to by mohl někdo podvrhnout)
        author_id: session.userId, 
        
        date_of_release: body.status === "PUBLISHED" ? new Date() : null,
        
        attachments: body.cover_image ? {
          create: [
            {
              filename: body.filename || "image.png",
              url: body.cover_image,
            }
          ]
        } : undefined,
      },
      include: {
        attachments: true
      }
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json({ message: "Failed to create article" }, { status: 500 });
  }
}