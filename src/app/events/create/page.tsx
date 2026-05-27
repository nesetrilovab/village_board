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
  const [text, setText] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const attachmentsArray: { filename: string; url: string }[] = [];

      if (selectedFiles && selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const newBlob = await upload(file.name, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          
          attachmentsArray.push({
            filename: file.name,
            url: newBlob.url,
          });
        }
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle: organizer || null,
          text, 
          address: address || null, 
          event_date: new Date(date).toISOString(),
          status,
          attachments: attachmentsArray, 
        }),
      });

      if (res.ok) {
        alert(status === "DRAFT" ? "Událost uložena do konceptů!" : "Událost vytvořena!");
        
        setTitle(""); 
        setText(""); 
        setAddress(""); 
        setDate(""); 
        setOrganizer(""); 
        setSelectedFiles(null);
      } else {
        const errData = await res.json();
        alert(`Chyba při ukládání: ${errData.message}`);
      }
    } catch (err) {
      console.error("Chyba při odesílání formuláře:", err);
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
                <Label>Status</Label>
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
                <Label>Adresa</Label>
                <Input  value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pořadatel</Label>
                <Input  value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Název události</Label>
              <Input  value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Podrobnosti</Label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-30" required />
            </div>

            <div className="space-y-2">
              <Label>Přílohy / Obrázky / Plakáty</Label>
              <Input 
                type="file" 
                multiple 
                onChange={(e) => setSelectedFiles(e.target.files)} 
              />
              {selectedFiles && selectedFiles.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Vybráno souborů: {selectedFiles.length}
                </p>
              )}
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