"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [existingPicture, setExistingPicture] = useState("");

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || "");
          setDescription(data.description || "");
          setLocation(data.location || "");
          setOrganizer(data.organizer || "");
          setStatus(data.status || "PUBLISHED");
          setExistingPicture(data.image_url || "");
          if (data.event_date) setDate(new Date(data.event_date).toISOString().slice(0, 16));
        }
      } catch (err) {
        console.error("Chyba při načítání události:", err);
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
      let coverUrl = existingPicture;
      if (coverImage) {
        const newBlob = await upload(coverImage.name, coverImage, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        coverUrl = newBlob.url;
      }

      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, location, organizer, status, image_url: coverUrl, event_date: new Date(date).toISOString() }),
      });

      if (res.ok) {
        alert("Událost upravena!");
        router.push(`/events/${id}`);
        router.refresh();
      }
    } catch (err) {
      alert("Chyba při ukládání.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Načítání události...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl border-t-8 border-t-green-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-800 text-center">Upravit událost</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <Label>Datum a čas</Label>
                <Input type="datetime-local" className="rounded-xl" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lokalita</Label>
                <Input className="rounded-xl" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Pořadatel</Label>
                <Input className="rounded-xl" value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Název události</Label>
              <Input className="rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Popis akce</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[120px] rounded-xl" required />
            </div>

            <div className="space-y-2">
              <Label>Změnit plakát</Label>
              {existingPicture && <p className="text-[10px] text-green-600 font-bold italic">Plakát je nahrán</p>}
              <Input className="rounded-xl" type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
            </div>
<div className="space-y-2 pt-2 border-t mt-4">
              <Label className="text-green-700 font-bold">Stav události</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="rounded-xl bg-green-50 border-green-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Aktivní (Viditelný pro všechny)</SelectItem>
                  <SelectItem value="DRAFT">Koncept (Uvidíte jen vy)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 rounded-xl">Zrušit</Button>
              <Button disabled={isSubmitting} className="flex-[2] bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md">
                {isSubmitting ? "Ukládám..." : "Uložit změny"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}