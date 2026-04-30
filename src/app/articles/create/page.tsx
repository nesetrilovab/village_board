"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ArticleForm() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
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

      const uploadedAttachments = await Promise.all(
        attachments.map(async (file) => {
          const newBlob = await upload(file.name, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          return { filename: file.name, url: newBlob.url };
        })
      );

      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          text,
          status,
          cover_image: coverUrl,
          attachments: uploadedAttachments,
          author_id: "616a8870-e898-486a-bff8-7853cdbf786b",
          date_of_release: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        alert(status === "DRAFT" ? "Koncept článku uložen!" : "Článek publikován! 📰");
        setTitle(""); setSubtitle(""); setText(""); setCoverImage(null); setAttachments([]);
      }
    } catch (err) {
      alert("Chyba při ukládání článku.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Nový článek</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Viditelnost (Status)</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Zveřejnit ihned</SelectItem>
                    <SelectItem value="DRAFT">Uložit jako koncept</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Podnadpis (volitelný)</Label>
                <Input placeholder="Krátké info pod nadpis" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Název článku</Label>
              <Input placeholder="Hlavní titulek" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Obsah článku</Label>
              <Textarea placeholder="Pište zde..." value={text} onChange={(e) => setText(e.target.value)} className="min-h-[200px]" required />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Titulní foto</Label>
                <Input type="file" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
              </div>
              <div className="space-y-2">
                <Label>Přílohy (PDF, atd.)</Label>
                <Input type="file" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} />
              </div>
            </div>

            <Button disabled={isSubmitting} className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Ukládám..." : status === "DRAFT" ? "Uložit koncept" : "Publikovat článek"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}