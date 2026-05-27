import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// 1. GET

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const article = await prisma.articles.findUnique({
      where: { id: id },
      include: {
        author: true,
        attachments: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { message: "Article could not be found" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error: any) {
    console.error("GET /api/articles/[id] error:", error);
    return NextResponse.json(
      { message: "Error while loading article", detail: error.message },
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

    const { title, subtitle, text, address, status, attachments } = body;

    const updatedArticle = await prisma.$transaction(async (tx) => {
      
      if (attachments && Array.isArray(attachments)) {
        await tx.attachments.deleteMany({
          where: { article_id: id },
        });
      }

      return await tx.articles.update({
        where: { id: id },
        data: {
          title,
          subtitle: subtitle || null,
          text,
          address: address || null, 
          status: status?.toUpperCase() || "DRAFT",
          date_of_release: status?.toUpperCase() === "PUBLISHED" ? new Date() : null,
          
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

    return NextResponse.json(updatedArticle);
  } catch (error: any) {
    console.error("PATCH /api/articles/[id] error:", error);
    return NextResponse.json(
      { message: "Error while processing article", detail: error.message },
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

    await prisma.articles.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Deleted successfully." });
  } catch (error: any) {
    console.error("DELETE /api/articles/[id] error:", error);
    return NextResponse.json(
      { message: "Error while deleting.", detail: error.message },
      { status: 500 }
    );
  }
}