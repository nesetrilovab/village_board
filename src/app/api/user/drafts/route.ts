import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Najdeme drafty ve všech tabulkách pro daného uživatele
    const [articles, events, ads] = await Promise.all([
      prisma.articles.findMany({ where: { author_id: session.userId, status: "DRAFT" } }),
      prisma.events.findMany({ where: { author_id: session.userId, status: "DRAFT" } }),
      prisma.ads.findMany({ where: { author_id: session.userId, status: "DRAFT" } }),
    ]);

    // Spojíme to do jednoho seznamu a označíme typy
    const allDrafts = [
      ...articles.map(a => ({ ...a, type: "ARTICLE" })),
      ...events.map(e => ({ ...e, type: "EVENT" })),
      ...ads.map(a => ({ ...a, type: "AD" })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(allDrafts);
  } catch (error) {
    return NextResponse.json({ message: "Chyba serveru" }, { status: 500 });
  }
}