import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";



export async function GET() {
  try {
    const ads = await prisma.ads.findMany({
      include: {
        attachments: true,
        author: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(ads);
  } catch (error: any) {
    console.error("GET /api/ads error:", error);
    return NextResponse.json(
      { message: "Error while loading advertisements", detail: error.message },
      { status: 500 }
    );
  }
}



export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { message: "To create an advertisement, you have to be logged in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { ad_type, title, item_name, price, text, address, status, attachments } = body;

    const ad = await prisma.ads.create({
      data: {
        ad_type: ad_type?.toUpperCase() || "ITEM",
        title,
        item_name: item_name || null,
        price: price ? Number(price) : null,
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
          })),
        } : undefined,
      },
      include: {
        attachments: true,
      }
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/ads error:", error);
    return NextResponse.json(
      { message: "Error while loading advertisement", detail: error.message },
      { status: 500 }
    );
  }
}