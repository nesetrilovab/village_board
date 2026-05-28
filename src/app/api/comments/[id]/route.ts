import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const commentId = params.id;

    const existingLike = await prisma.comment_likes.findUnique({
      where: {
        comment_id_user_id: {
          comment_id: commentId,
          user_id: session.userId,
        },
      },
    });

    if (existingLike) {
      await prisma.comment_likes.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.comment_likes.create({
        data: {
          comment_id: commentId,
          user_id: session.userId,
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("LIKE_TOGGLE_ERROR:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const commentId = params.id;

    const comment = await prisma.comments.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 });
    }

    const isAuthor = comment.user_id === session.userId;
    const isAdmin = session.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.comments.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("COMMENT_DELETE_ERROR:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}