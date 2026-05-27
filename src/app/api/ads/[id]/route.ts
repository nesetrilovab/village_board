import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// 1. GET: Načtení detailu inzerátu včetně jeho příloh

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
        { message: "Inzerát nebyl nalezen" },
        { status: 404 }
      );
    }

    return NextResponse.json(ad);
  } catch (error: any) {
    console.error("GET /api/ads/[id] error:", error);
    return NextResponse.json(
      { message: "Chyba při načítání detailu inzerátu", detail: error.message },
      { status: 500 }
    );
  }
}


// 2. PATCH: Aktualizace inzerátu a správa jeho příloh

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
          text, // Nový sjednocený název
          address: address || null, 
          status: status?.toUpperCase() || "DRAFT",
          date_of_release: status?.toUpperCase() === "PUBLISHED" ? new Date() : null,
          
          // Pokud máme nové přílohy, vytvoříme je v tabulce attachments
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
      { message: "Chyba při úpravě inzerátu", detail: error.message },
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