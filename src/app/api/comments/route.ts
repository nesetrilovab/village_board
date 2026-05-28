import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { text, articleId, eventId, parentId } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json({ message: "Comment cannot be empty" }, { status: 400 });
    }

    const newComment = await prisma.comments.create({
      data: {
        text,
        user_id: session.userId,
        article_id: articleId || null,
        event_id: eventId || null,
        parent_id: parentId || null,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("COMMENT_POST_ERROR:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}