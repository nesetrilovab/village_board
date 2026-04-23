"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Stavy pro data z databáze
  const [adType, setAdType] = useState("ITEM");
  const [title, setTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [existingPicture, setExistingPicture] = useState("");
  const [status, setStatus] = useState("PUBLISHED");

  // Stavy pro upload a proces
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Načtení dat inzerátu při startu
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/feed/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAdType(data.ad_type || "ITEM");
          setTitle(data.title || "");
          setItemName(data.item_name || "");
          // Ošetření názvu pole: bere description nebo text
          setDescription(data.description || data.text || "");
          setPrice(data.price ? data.price.toString() : "");
          setLocation(data.location || "");
          setExistingPicture(data.picture || data.cover_image || "");
          setStatus(data.status || "PUBLISHED"); // Načtení statusu z DB
        }
      } catch (err) {
        console.error("Chyba při načítání inzerátu:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAd();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Vyřešení obrázku (nový vs původní)
      let coverUrl = existingPicture;
      if (coverImage) {
        const formData = new FormData();
        formData.append("file", coverImage);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        coverUrl = data.url;
      }

      // 2. Odeslání změn (PATCH)
      const res = await fetch(`/api/feed/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_type: adType,
          title: title,
          item_name: itemName,
          description: description, 
          text: description,        
          price: price ? parseFloat(price) : null,
          location: location,
          picture: coverUrl,
          cover_image: coverUrl,    
          status: status,           // Klíčové: Odesíláme aktuálně vybraný status
        }),
      });

      if (res.ok) {
        alert("Inzerát úspěšně upraven! ✨");
        router.push(`/feed/${id}`);
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Chyba: ${errorData.message || "Nepodařilo se uložit změny"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Něco se nepovedlo při komunikaci se serverem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Načítání inzerátu...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl border-t-8 border-t-yellow-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-800 text-center">Upravit inzerát</CardTitle>
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
              <Textarea placeholder="Detailní informace..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[150px] rounded-xl" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cena (Kč)</Label>
                <Input className="rounded-xl" type="number" placeholder="Dohodou" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Změnit fotku</Label>
                {existingPicture && <p className="text-[10px] text-yellow-600 font-bold italic">Obrázek je již nastaven</p>}
                <Input className="rounded-xl cursor-pointer" type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
              </div>
            </div>

            {/* STATUS SEKCE */}
            <div className="space-y-2 pt-2 border-t mt-4">
              <Label className="text-yellow-700 font-bold">Stav inzerátu</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="rounded-xl bg-yellow-50 border-yellow-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Aktivní (Viditelný pro všechny)</SelectItem>
                  <SelectItem value="DRAFT">Koncept (Uvidíte jen vy)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 rounded-xl">
                Zrušit
              </Button>
              <Button disabled={isSubmitting} className="flex-[2] bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl shadow-md transition-all">
                {isSubmitting ? "Ukládám..." : "Uložit změny"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}