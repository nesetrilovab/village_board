"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EventForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let coverUrl = "";
      if (coverImage) {
        const newBlob = await upload(coverImage.name, coverImage, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        coverUrl = newBlob.url;
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          location,
          event_date: new Date(date).toISOString(),
          organizer,
          image_url: coverUrl,
          status,
          author_id: "616a8870-e898-486a-bff8-7853cdbf786b",
        }),
      });

      if (res.ok) {
        alert(status === "DRAFT" ? "Událost uložena do konceptů!" : "Událost vytvořena!");
        setTitle(""); setDescription(""); setLocation(""); setDate(""); setOrganizer(""); setCoverImage(null);
      }
    } catch (err) {
      alert("Chyba při ukládání události.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Nová událost</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Viditelnost (Status)</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Zveřejnit akci</SelectItem>
                    <SelectItem value="DRAFT">Uložit koncept</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Datum a čas konání</Label>
                <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lokalita</Label>
                <Input placeholder="Kde se akce koná?" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Pořadatel / Organizátor</Label>
                <Input placeholder="Např. SDH Lhota" value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Název události</Label>
              <Input placeholder="Název akce" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Podrobnosti o akci</Label>
              <Textarea placeholder="Program, vstupné, atd..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[120px]" required />
            </div>

            <div className="space-y-2">
              <Label>Plakát / Ilustrační foto</Label>
              <Input type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
            </div>

            <Button disabled={isSubmitting} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
              {isSubmitting ? "Ukládám..." : status === "DRAFT" ? "Uložit koncept" : "Vytvořit událost"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}