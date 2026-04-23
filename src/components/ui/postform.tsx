"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PostForm({ initialData, type, userId }: { initialData?: any, type: "ARTICLE" | "EVENT" | "AD", userId: string }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [text, setText] = useState(initialData?.text || initialData?.description || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [price, setPrice] = useState(initialData?.price || "");
  
  // Soubory
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Upload Cover Image (jen pokud byl vybrán nový)
      let coverUrl = initialData?.cover_image || "";
      if (coverImage) {
        const formData = new FormData();
        formData.append("file", coverImage);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        coverUrl = data.url;
      }

      // 2. Upload Multi-Attachments
      const newAttachments = await Promise.all(
        attachments.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          return { filename: file.name, url: data.url };
        })
      );

      // 3. Odeslání dat
      const url = isEdit ? `/api/feed/${initialData.id}` : `/api/${type.toLowerCase()}s`;
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          text,
          description: text,
          status,
          price: type === "AD" ? Number(price) : undefined,
          author_id: userId,
          cover_image: coverUrl,
          // Při editaci můžeme přílohy buď přičíst, nebo nahradit (tady je přidáme k těm starým)
          attachments: isEdit ? [...(initialData.attachments || []), ...newAttachments] : newAttachments,
          date_of_release: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        router.push(isEdit ? `/feed/${initialData.id}` : "/feed");
        router.refresh();
      }
    } catch (err) {
      alert("Chyba při ukládání.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-8">
      <Card className="w-full max-w-4xl shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-slate-800 text-center">
            {isEdit ? `Upravit ${type.toLowerCase()}` : `Nový ${type.toLowerCase()}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... Nadpis, Status, Podnadpis/Cena zůstávají stejné ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nadpis</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft (Rozpracováno)</SelectItem>
                    <SelectItem value="PUBLISHED">Published (Zveřejnit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Obsah</Label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[200px]" required />
            </div>

            {/* SOUBORY - Ta vizuální část, co jsi měla předtím */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <div className="space-y-2">
                <Label>Titulní obrázek</Label>
                {isEdit && initialData.cover_image && (
                  <p className="text-xs text-slate-500 mb-1">Aktuální: {initialData.cover_image.split('/').pop()}</p>
                )}
                <Input type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
              </div>
              <div className="space-y-2">
                <Label>Přílohy (PDF, dokumenty...)</Label>
                <Input type="file" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} />
              </div>
            </div>

            <Button disabled={isSubmitting} className="w-full bg-blue-600 h-14 text-lg rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
              {isSubmitting ? "Ukládám soubory a data..." : isEdit ? "Uložit změny" : "Publikovat článek"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}