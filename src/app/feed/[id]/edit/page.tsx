import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function EditRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const article = await prisma.articles.findUnique({ where: { id } });
  if (article) redirect(`/articles/edit/${id}`);

  const event = await prisma.events.findUnique({ where: { id } });
  if (event) redirect(`/events/edit/${id}`);

  const ad = await prisma.ads.findUnique({ where: { id } });
  if (ad) redirect(`/ads/edit/${id}`);

  return <p>Příspěvek nenalezen.</p>;
}