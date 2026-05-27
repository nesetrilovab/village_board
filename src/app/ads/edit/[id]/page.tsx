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

export default function EditAdForm() {
  const router = useRouter();
  const { id } = useParams();

  const [adType, setAdType] = useState("ITEM");
  const [title, setTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [text, setText] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState(""); 
  
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadAdData() {
      try {
        const res = await fetch(`/api/feed/${id}`);
        if (!res.ok) throw new Error("Error while loading advertisement");
        
        const data = await res.json();
        
        setAdType(data.ad_type || "ITEM");
        setTitle(data.title || "");
        setItemName(data.item_name || "");
        setText(data.text || "");
        setPrice(data.price ? data.price.toString() : "");
        setAddress(data.address || "");
        setExistingAttachments(data.attachments || []);
      } catch (err) {
        console.error(err);
        alert("Could not load appropriate data.");
      } finally {
        setIsLoading(false);
      }
    }
    loadAdData();
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
          ad_type: adType,
          title,
          item_name: itemName || null,
          text, 
          price: price ? parseFloat(price) : null,
          address: address || null, 
          attachments: attachmentsArray, 
        }),
      });

      if (!res.ok) throw new Error("Advertisement update was not successful");
      
      router.push(`/feed/${id}`);
      router.refresh();

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-100 flex justify-center items-center text-slate-500">Loading ad details...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-800">Edit advertisement</CardTitle>
          <p className="text-slate-500 text-sm">Modify the details of your advertisement below.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={adType} onValueChange={setAdType}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ITEM">Item</SelectItem>
                    <SelectItem value="SERVICE">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input className="rounded-xl" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input className="rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>{adType === "ITEM" ? "What are you selling?" : "What are you offering"}</Label>
              <Input className="rounded-xl" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[120px] rounded-xl" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (CZK)</Label>
                <Input className="rounded-xl" type="number" placeholder="Up for negotiation" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Add photos</Label>
                <Input 
                  className="rounded-xl cursor-pointer" 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(e.target.files)} 
                />
              </div>
            </div>

            {existingAttachments.length > 0 && (
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Current photos saved: {existingAttachments.length}
              </p>
            )}

            {selectedFiles && selectedFiles.length > 0 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                New photos selected: {selectedFiles.length}
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()} 
                className="w-1/3 py-6 rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button 
                disabled={isSubmitting} 
                className="w-2/3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6 rounded-xl shadow-md transition-all"
              >
                {isSubmitting ? "Saving changes..." : "Update advertisement"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}