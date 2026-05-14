import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma"; // Uprav cestu ke svému prisma klientovi

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    // Ověření, že zpráva skutečně přišla od Stripe a nikdo ji nezfalšoval
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Zpracování události "checkout.session.completed"
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const adId = session.metadata?.adId;

    if (adId) {
      console.log(`✅ Platba úspěšná pro inzerát: ${adId}`);

      try {
        // AKTUALIZACE DATABÁZE
        await prisma.ads.update({
          where: { id: adId },
          data: { status: "PUBLISHED" },
        });

        return NextResponse.json({ received: true });
      } catch (error) {
        console.error("Chyba při aktualizaci databáze:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}