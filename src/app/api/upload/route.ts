import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // 1. Základní kontrola souboru
    if (!file || !file.name) {
      return NextResponse.json(
        { error: "Nebyl nahrán žádný platný soubor" },
        { status: 400 }
      );
    }

    // 2. Nahrání do Vercel Blob
    // put() automaticky vyřeší unikátní název (přidá náhodný hash)
    // a nahradí nebezpečné znaky v názvu souboru.
    const blob = await put(file.name, file, {
      access: "public", // Aby byly fotky vidět na webu
    });

    // 3. Vrácení URL adresy
    // Vercel Blob vrací objekt, kde 'url' je přímo link na jejich CDN
    // Např: https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-xyz.jpg
    return NextResponse.json({ url: blob.url });

  } catch (error) {
    console.error("BLOB UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Nahrávání do cloudu selhalo" }, { status: 500 });
  }
}