import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { getSession } from "@/lib/auth"; 

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { rating, text, adId } = await req.json();

    if (!adId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const ad = await prisma.ads.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      return NextResponse.json({ message: "Ad not found" }, { status: 404 });
    }

    if (ad.author_id === session.userId) {
      return NextResponse.json({ message: "You cannot review your own advertisement" }, { status: 400 });
    }

    const existingReview = await prisma.reviews.findUnique({
      where: {
        ad_id_user_id: {
          ad_id: adId,
          user_id: session.userId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ message: "You have already reviewed this advertisement" }, { status: 400 });
    }

    // 5. Uložení
    const newReview = await prisma.reviews.create({
      data: {
        rating: Number(rating),
        text,
        ad_id: adId,
        user_id: session.userId,
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("REVIEW_POST_ERROR:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}