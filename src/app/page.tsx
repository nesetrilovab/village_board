import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function RootPage() {
  const session = await getSession();

  if (!session) {
    // Pokud není přihlášený, okamžitě ho pošli na login
    redirect("/login");
  } else {
    // Pokud už je přihlášený, hoď ho rovnou na nástěnku
    redirect("/feed");
  }
}