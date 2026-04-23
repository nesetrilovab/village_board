"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EventForm() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [text, setText] = useState("");
  const [address, setAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [status, setStatus] = useState("PUBLISHED"); // 1. Přidán stav pro status
  const [coverImage, setCoverImage] = useState<File | null>(null);
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

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          subtitle, 
          text, 
          address, 
          event_date: eventDate, 
          cover_image: coverUrl,
          status: status // 2. Odesíláme zvolený status (DRAFT nebo PUBLISHED)
        }),
      });

      if (res.ok) {
        alert(status === "DRAFT" ? "Událost uložena jako koncept! 📁" : "Událost byla vytvořena! 📅");
        // Reset formuláře
        setTitle(""); setSubtitle(""); setText(""); setAddress(""); setEventDate(""); setCoverImage(null);
        setStatus("PUBLISHED");
      }
    } catch (err) {
      console.error(err);
      alert("Něco se nepovedlo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl border-green-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-800">Nová událost / Akce</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 3. Výběr statusu */}
            <div className="space-y-2 p-4 bg-green-50 rounded-xl border border-green-100">
              <Label className="text-green-800 font-semibold">Viditelnost akce</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white border-green-200">
                  <SelectValue placeholder="Vyberte status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Zveřejnit ihned (Viditelné pro všechny)</SelectItem>
                  <SelectItem value="DRAFT">Uložit jako koncept (Pouze pro vás)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Název akce</Label>
              <Input placeholder="Např. Pálení čarodějnic" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Krátké motto / podnadpis</Label>
              <Input placeholder="Např. Tradiční setkání u potoka" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kdy se akce koná?</Label>
                <Input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Místo konání (Adresa)</Label>
                <Input placeholder="Např. Fotbalové hřiště" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Popis akce</Label>
              <Textarea placeholder="Podrobný program, vstupné..." value={text} onChange={(e) => setText(e.target.value)} className="min-h-[150px]" required />
            </div>

            <div className="space-y-2">
              <Label>Plakát / Úvodní fotka</Label>
              <Input type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
            </div>

            <Button disabled={isSubmitting} className="w-full mt-4 bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Ukládám..." : status === "DRAFT" ? "Uložit jako rozpracované" : "Vytvořit událost"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}