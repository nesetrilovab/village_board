"use client";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateArticlePage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("DRAFT"); // Velká písmena
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Upload Cover Image
      let coverUrl = "";
      if (coverImage) {
        const formData = new FormData();
        formData.append("file", coverImage); // Ujisti se, že api/upload čeká "file"
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        coverUrl = data.url;
      }

      // 2. Upload Multi-Attachments
      const uploadedAttachments = await Promise.all(
        attachments.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          return { filename: file.name, url: data.url };
        })
      );

      // 3. Create Article
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          text,
          status,
          author_id: "616a8870-e898-486a-bff8-7853cdbf786b", // TODO: replace with real auth
          cover_image: coverUrl,
          attachments: uploadedAttachments, // Teď už posíláme reálná data
          date_of_release: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert("Článek vytvořen 🎉");
        // Reset formuláře
        setTitle(""); setSubtitle(""); setText(""); setAttachments([]);
      }
    } catch (err) {
      alert("Něco se nepovedlo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-8">
      <Card className="w-full max-w-4xl shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-slate-800 text-center">Nový článek</CardTitle>
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
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[200px]" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
              <div className="space-y-2">
                <Label>Titulní obrázek</Label>
                <Input type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
              </div>
              <div className="space-y-2">
                <Label>Přílohy (PDF, dokumenty...)</Label>
                <Input type="file" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} />
              </div>
            </div>

            <Button disabled={isSubmitting} className="w-full bg-blue-600 h-12 text-lg">
              {isSubmitting ? "Ukládám..." : "Vytvořit článek"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}