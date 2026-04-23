"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdForm() {
  const [adType, setAdType] = useState("ITEM");
  const [title, setTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [status, setStatus] = useState("PUBLISHED"); // 1. Přidán stav pro status
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let coverUrl = "";
      if (coverImage) {
        const formData = new FormData();
        formData.append("file", coverImage);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        coverUrl = data.url;
      }

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
          status: status, // 2. Odesíláme zvolený status
          author_id: "616a8870-e898-486a-bff8-7853cdbf786b", 
        }),
      });

      if (res.ok) {
        alert(status === "DRAFT" ? "Koncept uložen! 📁" : "Inzerát vystaven! 🎉");
        // Reset formuláře
        setTitle(""); setItemName(""); setDescription(""); setPrice(""); setLocation(""); setCoverImage(null);
        setStatus("PUBLISHED");
      }
    } catch (err) {
      console.error(err);
      alert("Chyba při ukládání.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Nový inzerát</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Typ a Status vedle sebe */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typ inzerátu</Label>
                <Select value={adType} onValueChange={setAdType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ITEM">Předmět (Prodej/Darování)</SelectItem>
                    <SelectItem value="SERVICE">Služba (Nabídka práce/pomoci)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Viditelnost (Status)</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Zveřejnit (Published)</SelectItem>
                    <SelectItem value="DRAFT">Uložit jako koncept (Draft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lokalita</Label>
                <Input placeholder="Např. Horní Lhota" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cena (Kč)</Label>
                <Input type="number" placeholder="Dohodou" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Název inzerátu</Label>
              <Input placeholder="Stručný nadpis" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>{adType === "ITEM" ? "Co prodáváte?" : "Název služby"}</Label>
              <Input placeholder="Např. Sekačka / Doučování" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea placeholder="Detailní informace..." value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Fotka</Label>
              <Input type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
            </div>

            <Button disabled={isSubmitting} className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700">
              {isSubmitting ? "Ukládám..." : status === "DRAFT" ? "Uložit koncept" : "Zveřejnit inzerát"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}