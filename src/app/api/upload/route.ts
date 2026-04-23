import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // Vytáhneme soubor podle tvého preferovaného názvu
   const file = formData.get("file") as File | null;

    // Kontrola, zda soubor skutečně dorazil a není to jen prázdný string
    if (!file || !file.name) {
      return NextResponse.json(
        { error: "No valid file uploaded" },
        { status: 400 }
      );
    }

    // Převedení na Buffer pro zápis přes 'fs'
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cesta do složky public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Synchronní kontrola a vytvoření složky (to máš správně)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Vytvoření unikátního názvu souboru
    // Nahradíme mezery podtržítky, aby URL nezlobila
    const safeFileName = file.name.replace(/\s+/g, "_");
    const fileName = `${Date.now()}-${safeFileName}`;
    const filePath = path.join(uploadDir, fileName);

    // Zápis souboru na disk
    fs.writeFileSync(filePath, buffer);

    // Vrátíme URL, kterou pak uložíš do DB
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({ url: fileUrl });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}