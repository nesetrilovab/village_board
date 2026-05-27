import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";


// 1. GET

export async function GET() {
  try {
    const articles = await prisma.articles.findMany({
      include: { 
        attachments: true,
        author: true 
      },
      orderBy: { created_at: "desc" },
    });
    
    return NextResponse.json(articles);
  } catch (error: any) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json(
      { message: "Chyba při načítání článků", detail: error.message }, 
      { status: 500 }
    );
  }
}


// 2. POST:

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { message: "Pro tuto akci se musíte přihlásit" }, 
        { status: 401 }
      );
    }

    const body = await req.json();

    const { title, subtitle, text, address, status, attachments } = body;

    const article = await prisma.articles.create({
      data: {
        title,
        subtitle: subtitle || null,
        text,
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
          }))
        } : undefined,
      },
      include: {
        attachments: true
      }
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json(
      { message: "Chyba při ukládání článku", detail: error.message }, 
      { status: 500 }
    );
  }
}