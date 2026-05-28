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

    const canSee = (item: any) => {
      if (item.status === "PUBLISHED") return true;
      if (!session) return false;
      if (session.role === "ADMIN") return true;
      return item.author_id === session.userId;
    };

    const article = await prisma.articles.findUnique({
      where: { id },
      include: { attachments: true, author: true },
    });
    if (article) {
      if (!canSee(article)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      return NextResponse.json({ ...article, type: "ARTICLE" });
    }

    const event = await prisma.events.findUnique({
      where: { id },
      include: { attachments: true, author: true },
    });
    if (event) {
      if (!canSee(event)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      return NextResponse.json({ ...event, type: "EVENT" });
    }

    const ad = await prisma.ads.findUnique({
      where: { id },
      include: { author: true,
  attachments: true,
  reviews: {
    include: {
      user: true, 
    },
    orderBy: {
      created_at: "desc",
    },
  },},
    });
    if (ad) {
      if (!canSee(ad)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      return NextResponse.json({ ...ad, type: "AD" });
    }

    return NextResponse.json({ message: "Post could not be found" }, { status: 404 });
  } catch (error) {
    console.error("DETAIL_FETCH_ERROR", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const session = await getSession();

    if (!session) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

    const article = await prisma.articles.findUnique({ where: { id } });
    const event = await prisma.events.findUnique({ where: { id } });
    const ad = await prisma.ads.findUnique({ where: { id } });

    const item = article || event || ad;
    if (!item) return NextResponse.json({ message: "Post could not be found" }, { status: 404 });

    if (item.author_id !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ message: "You do not have the appropriate rights" }, { status: 403 });
    }

    const { 
      title, 
      subtitle, 
      text, 
      address, 
      status, 
      price, 
      ad_type, 
      item_name, 
      event_date, 
      attachments = [] 
    } = body;

    if (!title || !text) {
      return NextResponse.json({ message: "Title and content are required." }, { status: 400 });
    }

    const attachmentsData = {
      deleteMany: {}, 
      create: attachments.map((att: any) => ({
        filename: att.filename,
        url: att.url
      }))
    };

    if (article) {
      const updatedArticle = await prisma.articles.update({
        where: { id },
        data: {
          title,
          subtitle: subtitle || null,
          text,
          address: address || null,
          status: status || "PUBLISHED",
          attachments: attachmentsData
        },
      });
      return NextResponse.json(updatedArticle, { status: 200 });
    }

    if (event) {
      const updatedEvent = await prisma.events.update({
        where: { id },
        data: {
          title,
          subtitle: subtitle || null, 
          text,
          address: address || null,
          event_date: event_date ? new Date(event_date) : undefined,
          status: status || "PUBLISHED",
          attachments: attachmentsData
        },
      });
      return NextResponse.json(updatedEvent, { status: 200 });
    }

    if (ad) {
      const updatedAd = await prisma.ads.update({
        where: { id },
        data: {
          title,
          ad_type: ad_type || "ITEM",
          item_name: item_name || null,
          text: text,
          address: address || null,
          price: price !== undefined && price !== null ? parseFloat(price.toString()) : null,
          status: status || "DRAFT",
          attachments: attachmentsData
        },
      });
      return NextResponse.json(updatedAd, { status: 200 });
    }

    return NextResponse.json({ message: "Post type could not be recognized" }, { status: 400 });

  } catch (error: any) {
    console.error("Backend error PUT /api/feed/[id]:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

    const article = await prisma.articles.findUnique({ where: { id } });
    const event = await prisma.events.findUnique({ where: { id } });
    const ad = await prisma.ads.findUnique({ where: { id } });

    const item = article || event || ad;
    if (!item) return NextResponse.json({ message: "Not found." }, { status: 404 });

    if (item.author_id !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ message: "You do not have the appropriate rights" }, { status: 403 });
    }

    if (article) await prisma.articles.delete({ where: { id } });
    if (event) await prisma.events.delete({ where: { id } });
    if (ad) await prisma.ads.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted successfully." });
  } catch (error) {
    return NextResponse.json({ message: "Error while deleting." }, { status: 500 });
  }
}