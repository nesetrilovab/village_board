"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditEventForm() {
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadEventData() {
      try {
        const res = await fetch(`/api/feed/${id}`);
        if (!res.ok) throw new Error("Error while loading event");
        
        const data = await res.json();
        
        setTitle(data.title || "");
        setText(data.text || "");
        setAddress(data.address || "");
        setOrganizer(data.subtitle || "");
        setStatus(data.status || "PUBLISHED");
        setExistingAttachments(data.attachments || []);

        if (data.event_date) {
          const localDate = new Date(data.event_date);
          const offset = localDate.getTimezoneOffset() * 60000;
          const adjustedDate = new Date(localDate.getTime() - offset);
          setDate(adjustedDate.toISOString().slice(0, 16));
        }
      } catch (err) {
        console.error(err);
        alert("Could not load event data.");
      } finally {
        setIsLoading(false);
      }
    }
    loadEventData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const attachmentsArray = [...existingAttachments];

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

      const res = await fetch(`/api/feed/${id}`, {
        method: "PUT",
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

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Server returned an error");
      }

      router.push(`/feed/${id}`);
      router.refresh();

    } catch (err: any) {
      console.error("Error while processing form:", err);
      alert(`Chyba: ${err.message || "Something went wrong."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-100 flex justify-center items-center text-slate-500">Loading event details...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit event</CardTitle>
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
                <Label>Date and Time</Label>
                <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Organizer</Label>
                <Input value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-30" required />
            </div>

            <div className="space-y-2">
              <Label>Add attachments</Label>
              <Input 
                type="file" 
                multiple 
                onChange={(e) => setSelectedFiles(e.target.files)} 
              />
              
              {existingAttachments.length > 0 && (
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  Current attachments saved: {existingAttachments.length}
                </p>
              )}

              {selectedFiles && selectedFiles.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  New attachments selected: {selectedFiles.length}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()} 
                className="w-1/3"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} className="w-2/3 bg-green-600 hover:bg-green-700 text-white">
                {isSubmitting ? "Processing changes..." : "Update event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}