"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
// Přidány importy pro Select
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Stavy pro data
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [text, setText] = useState("");
  const [address, setAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [status, setStatus] = useState("PUBLISHED"); // 1. Stav pro status
  const [existingCoverImage, setExistingCoverImage] = useState("");
  
  // Stavy pro nové soubory a proces
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Načtení dat události
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/feed/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || "");
          setSubtitle(data.subtitle || "");
          setText(data.text || "");
          setAddress(data.address || "");
          setExistingCoverImage(data.cover_image || "");
          setStatus(data.status || "PUBLISHED"); // Načtení statusu z DB
          
          if (data.event_date) {
            const date = new Date(data.event_date);
            const formattedDate = date.toISOString().slice(0, 16);
            setEventDate(formattedDate);
          }
        }
      } catch (err) {
        console.error("Chyba při načítání akce:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let coverUrl = existingCoverImage;
      if (coverImage) {
        const formData = new FormData();
        formData.append("file", coverImage);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        coverUrl = data.url;
      }

      // 2. PATCH Update s aktuálním statusem
      const res = await fetch(`/api/feed/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          subtitle, 
          text, 
          address, 
          event_date: eventDate, 
          cover_image: coverUrl,
          status: status // 2. Posíláme zvolený status
        }),
      });

      if (res.ok) {
        alert("Událost byla aktualizována! 📅");
        router.push(`/feed/${id}`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Chyba při ukládání změn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Načítání události...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl border-t-8 border-t-green-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-800 text-center">Upravit událost / Akci</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 3. Volba Statusu */}
            <div className="space-y-2 p-4 bg-green-50 rounded-xl border border-green-100 mb-6">
              <Label className="text-green-800 font-bold">Stav události</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white border-green-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Publikováno (Vidí všichni)</SelectItem>
                  <SelectItem value="DRAFT">Koncept (Pouze pro autora)</SelectItem>
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
              <Textarea placeholder="Podrobný program..." value={text} onChange={(e) => setText(e.target.value)} className="min-h-[150px]" required />
            </div>

            <div className="space-y-2">
              <Label>Změnit plakát / fotku</Label>
              {existingCoverImage && <p className="text-[10px] text-green-600 font-bold italic">Plakát je již nahraný</p>}
              <Input type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 rounded-xl">
                Zrušit
              </Button>
              <Button disabled={isSubmitting} className="flex-[2] bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg">
                {isSubmitting ? "Ukládám..." : "Uložit změny"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}