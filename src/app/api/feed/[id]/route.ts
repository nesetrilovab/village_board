import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    // Pomocná funkce pro kontrolu práv na zobrazení
    const canSee = (item: any) => {
      if (item.status === "PUBLISHED") return true;
      if (!session) return false;
      if (session.role === "ADMIN") return true;
      return item.author_id === session.userId;
    };

    // 1. Článek
    const article = await prisma.articles.findUnique({
      where: { id },
      include: { attachments: true, author: true },
    });
    if (article) {
      if (!canSee(article)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      return NextResponse.json({ ...article, type: "ARTICLE" });
    }

    // 2. Akce
    const event = await prisma.events.findUnique({
      where: { id },
      include: { attachments: true, author: true },
    });
    if (event) {
      if (!canSee(event)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      return NextResponse.json({ ...event, type: "EVENT" });
    }

    // 3. Inzerát
    const ad = await prisma.ads.findUnique({
      where: { id },
      include: { author: true },
    });
    if (ad) {
      if (!canSee(ad)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      return NextResponse.json({ ...ad, type: "AD" });
    }

    return NextResponse.json({ message: "Příspěvek nenalezen" }, { status: 404 });
  } catch (error) {
    console.error("DETAIL_FETCH_ERROR", error);
    return NextResponse.json({ message: "Chyba na serveru" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const session = await getSession();

    // 1. Musí být přihlášen
    if (!session) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });

    // 2. Najdeme záznam kdekoli, abychom zjistili autora
    const article = await prisma.articles.findUnique({ where: { id } });
    const event = await prisma.events.findUnique({ where: { id } });
    const ad = await prisma.ads.findUnique({ where: { id } });

    const item = article || event || ad;
    if (!item) return NextResponse.json({ error: "Příspěvek nenalezen" }, { status: 404 });

    // 3. Kontrola práv: Autor nebo Admin
    const isOwner = item.author_id === session.userId;
    const isAdmin = session.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Nemáte oprávnění k úpravě" }, { status: 403 });
    }

    // 4. Samotný update podle typu
    if (article) {
      const updated = await prisma.articles.update({
        where: { id },
        data: {
          title: body.title,
          subtitle: body.subtitle,
          text: body.text || body.description,
          status: body.status,
          cover_image: body.cover_image || body.picture,
        },
      });
      return NextResponse.json(updated);
    }

    if (event) {
      const updated = await prisma.events.update({
        where: { id },
        data: {
          title: body.title,
          subtitle: body.subtitle,
          text: body.text || body.description,
          address: body.address,
          event_date: body.event_date ? new Date(body.event_date) : undefined,
          status: body.status,
          cover_image: body.cover_image || body.picture,
        },
      });
      return NextResponse.json(updated);
    }

    if (ad) {
      const updated = await prisma.ads.update({
        where: { id },
        data: {
          title: body.title,
          ad_type: body.ad_type,
          item_name: body.item_name,
          description: body.description || body.text,
          price: body.price ? parseFloat(body.price.toString()) : null,
          location: body.location,
          status: body.status,
          picture: body.picture || body.cover_image,
        },
      });
      return NextResponse.json(updated);
    }

  } catch (error: any) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Chyba při ukládání" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) return NextResponse.json({ message: "Nepřihlášen" }, { status: 401 });

    const article = await prisma.articles.findUnique({ where: { id } });
    const event = await prisma.events.findUnique({ where: { id } });
    const ad = await prisma.ads.findUnique({ where: { id } });

    const item = article || event || ad;
    if (!item) return NextResponse.json({ message: "Nenalezeno" }, { status: 404 });

    // Kontrola práv (Autor nebo Admin)
    if (item.author_id !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ message: "Nemáte oprávnění" }, { status: 403 });
    }

    if (article) await prisma.articles.delete({ where: { id } });
    if (event) await prisma.events.delete({ where: { id } });
    if (ad) await prisma.ads.delete({ where: { id } });

    return NextResponse.json({ message: "Smazáno" });
  } catch (error) {
    return NextResponse.json({ message: "Chyba při mazání" }, { status: 500 });
  }
}