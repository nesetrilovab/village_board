import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ad = await prisma.ads.findUnique({
      where: { id: id },
      include: {
        author: true,
        attachments: true, 
      },
    });

    if (!ad) {
      return NextResponse.json(
        { message: "Advertisement could not be found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ad);
  } catch (error: any) {
    console.error("GET /api/ads/[id] error:", error);
    return NextResponse.json(
      { message: "Error while loading advertisement", detail: error.message },
      { status: 500 }
    );
  }
}


export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { ad_type, title, item_name, price, text, address, status, attachments } = body;

    const updatedAd = await prisma.$transaction(async (tx) => {
      
      if (attachments && Array.isArray(attachments)) {
        await tx.attachments.deleteMany({
          where: { ad_id: id },
        });
      }

      return await tx.ads.update({
        where: { id: id },
        data: {
          ad_type: ad_type?.toUpperCase() || undefined,
          title,
          item_name: item_name || null,
          price: price ? Number(price) : null,
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

    return NextResponse.json(updatedAd);
  } catch (error: any) {
    console.error("PATCH /api/ads/[id] error:", error);
    return NextResponse.json(
      { message: "Error while editing advertisement", detail: error.message },
      { status: 500 }
    );
  }
}

// =======================================================
// 3. DELETE: Smazání inzerátu
// =======================================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.ads.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Inzerát byl úspěšně smazán" });
  } catch (error: any) {
    console.error("DELETE /api/ads/[id] error:", error);
    return NextResponse.json(
      { message: "Chyba při mazání inzerátu", detail: error.message },
      { status: 500 }
    );
  }
}