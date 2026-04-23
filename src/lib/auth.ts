import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getSession() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || "super_secret_key";
    return jwt.verify(token, secret) as { userId: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}