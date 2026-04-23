import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email a heslo jsou povinné" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ message: "Neplatné přihlašovací údaje" }, { status: 401 });
    }

    // V produkci použij process.env.JWT_SECRET!
    const secret = process.env.JWT_SECRET || "super_secret_key";
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Přihlášení úspěšné",
      user: { id: user.id, name: user.name, role: user.role }
    });

    // Nastavení bezpečné cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dní v sekundách
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ message: "Chyba při přihlašování" }, { status: 500 });
  }
}