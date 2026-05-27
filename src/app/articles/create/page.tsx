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
  const [address, setAddress] = useState(""); 
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

      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          text: text.trim(),
          address: address.trim() || null,
          status,
          attachments: attachmentsArray, 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Server returned an error");
      }

      alert(status === "DRAFT" ? "Draft saved!" : "Article published!");
      
      setTitle(""); 
      setSubtitle(""); 
      setText(""); 
      setAddress("");
      setSelectedFiles(null);

    } catch (err: any) {
      console.error("Error while processing:", err);
      alert(`Chyba: ${err.message || "Something went wrong."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">New article</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Publish</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
              <Input  value={title} onChange={(e) => setTitle(e.target.value)} required />

              </div>
            </div>

            

            <div className="space-y-2">
              <Label>Subtitle</Label>
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>
<div className="space-y-2">
              <Label>Address / Connected to location...</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[200px]" required />
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label>Attachments</Label>
              <Input 
                type="file" 
                multiple 
                onChange={(e) => setSelectedFiles(e.target.files)} 
              />
              {selectedFiles && selectedFiles.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Number of attachments selected: {selectedFiles.length}
                </p>
              )}
            </div>

            <Button disabled={isSubmitting} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Processing..." : status === "DRAFT" ? "Save draft" : "Publish article"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}