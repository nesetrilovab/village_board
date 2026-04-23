"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Stavy pro data
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [existingCoverImage, setExistingCoverImage] = useState("");
  const [existingAttachments, setExistingAttachments] = useState([]);
  
  // Stavy pro nové soubory
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Načtení stávajících dat článku
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/feed/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title);
          setSubtitle(data.subtitle || "");
          setText(data.text || "");
          setStatus(data.status);
          setExistingCoverImage(data.cover_image || "");
          setExistingAttachments(data.attachments || []);
        }
      } catch (err) {
        console.error("Chyba při načítání:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Upload nového Cover Image (pokud byl vybrán)
      let coverUrl = existingCoverImage;
      if (coverImage) {
        const formData = new FormData();
        formData.append("file", coverImage);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        coverUrl = data.url;
      }

      // 2. Upload nových příloh
      const newUploadedAttachments = await Promise.all(
        attachments.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          return { filename: file.name, url: data.url };
        })
      );

      // 3. Update Article (PATCH)
      const response = await fetch(`/api/feed/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          text,
          status,
          cover_image: coverUrl,
          // Spojíme staré přílohy s nově nahranými
          attachments: [...existingAttachments, ...newUploadedAttachments],
        }),
      });

      if (response.ok) {
        alert("Článek byl úspěšně upraven! ✨");
        router.push(`/feed/${id}`);
        router.refresh();
      }
    } catch (err) {
      alert("Něco se nepovedlo při ukládání.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Načítání dat článku...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-8">
      <Card className="w-full max-w-4xl shadow-xl rounded-3xl border-t-8 border-t-blue-600">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-slate-800 text-center">Upravit článek</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label>Podnadpis</Label>
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Text článku</Label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[250px]" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
              <div className="space-y-2">
                <Label>Titulní obrázek</Label>
                {existingCoverImage && <p className="text-[10px] text-blue-600 font-medium">Aktuálně uložen obrázek</p>}
                <Input type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
              </div>
              <div className="space-y-2">
                <Label>Přidat další přílohy</Label>
                <Input type="file" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} />
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()} 
                className="w-1/3 h-12 rounded-xl"
              >
                Zrušit
              </Button>
              <Button 
                disabled={isSubmitting} 
                className="w-2/3 bg-blue-600 h-12 text-lg rounded-xl shadow-lg shadow-blue-200"
              >
                {isSubmitting ? "Ukládám změny..." : "Uložit změny"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}