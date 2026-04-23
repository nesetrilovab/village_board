import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Chybí povinná pole" }, { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Uživatel s tímto emailem již existuje" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: "USER", // Defaultní role podle tvého schématu (pokud ji tam máš)
      },
    });

    return NextResponse.json({
      message: "Registrace proběhla úspěšně",
      user: { id: user.id, name: user.name, email: user.email },
    }, { status: 201 });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ message: "Registrace se nezdařila" }, { status: 500 });
  }
}