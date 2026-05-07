import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // nebo nejnovější
});

export async function POST(req: Request) {
  try {
    const { adId, title } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Inzerát: ${title}`,
            },
            unit_amount: 200, // 2.00 USD (zadává se v centech)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?id=${adId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/feed`,
      metadata: { adId }, // Důležité pro pozdější identifikaci inzerátu
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}