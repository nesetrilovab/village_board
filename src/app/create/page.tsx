"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateArticlePage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("draft");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        subtitle,
        text,
        status,
        author_id: "616a8870-e898-486a-bff8-7853cdbf786b",
        cover_image: null,
        attachments: [],
        date_of_release: new Date().toISOString(),
      }),
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      alert("Článek vytvořen 🎉");
      setTitle("");
      setSubtitle("");
      setText("");
      setStatus("draft");
    } else {
      alert("Chyba při vytváření článku");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-8">
      <Card className="w-full max-w-4xl shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-slate-800">
            Vytvořit nový článek
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nadpis */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Nadpis</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Zadej nadpis článku"
                className="h-12 text-lg"
                required
              />
            </div>

            {/* Podnadpis */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Podnadpis</Label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Zadej podnadpis"
                className="h-10 text-base"
              />
            </div>

            {/* Text článku */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Text článku</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Sem napiš obsah článku..."
                className="min-h-[250px] text-base"
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Vyber status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* TODO: Cover Image + Attachments */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Cover Image</Label>
              <Input type="file" className="text-sm" disabled placeholder="Přidáme později" />
            </div>

            <div className="space-y-2">
              <Label className="text-lg font-semibold">Attachments</Label>
              <Input type="file" multiple className="text-sm" disabled placeholder="Přidáme později" />
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
              Vytvořit článek
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}