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

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [existingPicture, setExistingPicture] = useState("");
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || "");
          setSubtitle(data.subtitle || "");
          setText(data.text || "");
          setStatus(data.status || "PUBLISHED");
          setExistingPicture(data.cover_image || "");
        }
      } catch (err) {
        console.error("Chyba při načítání článku:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
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

      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, text, status, cover_image: coverUrl }),
      });

      if (res.ok) {
        alert("Článek úspěšně upraven!");
        router.push(`/articles/${id}`);
        router.refresh();
      }
    } catch (err) {
      alert("Něco se nepovedlo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Načítání článku...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl border-t-8 border-t-blue-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-800 text-center">Upravit článek</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <Label>Podnadpis</Label>
                <Input className="rounded-xl" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Název článku</Label>
              <Input className="rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Obsah</Label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[250px] rounded-xl" required />
            </div>

            <div className="space-y-2">
              <Label>Titulní obrázek</Label>
              {existingPicture && <p className="text-[10px] text-blue-600 font-bold italic">Obrázek je nastaven</p>}
              <Input className="rounded-xl" type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
            </div>
<div className="space-y-2 pt-2 border-t mt-4">
              <Label className="text-blue-700 font-bold">Stav článku</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="rounded-xl bg-blue-50 border-blue-200">
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
              <Button disabled={isSubmitting} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                {isSubmitting ? "Ukládám..." : "Uložit změny"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}