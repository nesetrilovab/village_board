"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdForm() {
  const router = useRouter();
  const [adType, setAdType] = useState("ITEM");
  const [title, setTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Upload obrázku přes Vercel Blob (pokud je vybrán)
      let coverUrl = "";
      if (coverImage) {
        const newBlob = await upload(coverImage.name, coverImage, {
          access: 'public',
          handleUploadUrl: '/api/upload', 
        });
        coverUrl = newBlob.url;
      }

      // 2. Uložení inzerátu do DB jako DRAFT
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_type: adType,
          title,
          item_name: itemName,
          description,
          price: price ? parseFloat(price) : null,
          location,
          picture: coverUrl,
          status: "DRAFT", // Vždy ukládáme jako koncept před platbou
          author_id: "616a8870-e898-486a-bff8-7853cdbf786b", // Tvůj testovací autor
        }),
      });

      if (!res.ok) throw new Error("Nepodařilo se vytvořit inzerát");
      
      const createdAd = await res.json();

      // 3. Inicializace Stripe Checkoutu
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId: createdAd.id,
          title: title,
        }),
      });

      const { url, error } = await checkoutRes.json();

      if (url) {
        // Přesměrování na Stripe bránu
        window.location.href = url;
      } else {
        throw new Error(error || "Chyba při vytváření platby");
      }

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Něco se nepovedlo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-800 text-center">Nový inzerát</CardTitle>
          <p className="text-center text-slate-500 text-sm">Vystavení inzerátu stojí 2.00 USD</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typ inzerátu</Label>
                <Select value={adType} onValueChange={setAdType}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ITEM">Předmět (Prodej/Darování)</SelectItem>
                    <SelectItem value="SERVICE">Služba (Nabídka práce/pomoci)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lokalita</Label>
                <Input className="rounded-xl" placeholder="Např. Horní Lhota" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Název inzerátu (Nadpis)</Label>
              <Input className="rounded-xl" placeholder="Stručný nadpis" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>{adType === "ITEM" ? "Co prodáváte?" : "Název služby"}</Label>
              <Input className="rounded-xl" placeholder="Např. Sekačka / Doučování" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea placeholder="Detailní informace..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[120px] rounded-xl" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cena (Kč)</Label>
                <Input className="rounded-xl" type="number" placeholder="Dohodou" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fotka</Label>
                <Input className="rounded-xl cursor-pointer" type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
              </div>
            </div>

            <Button disabled={isSubmitting} className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6 rounded-xl shadow-md transition-all">
              {isSubmitting ? "Zpracovávám..." : "Zaplatit a zveřejnit (2 USD)"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}