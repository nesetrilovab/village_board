"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdForm() {
  const router = useRouter();
  const [adType, setAdType] = useState("ITEM");
  const [title, setTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [text, setText] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState(""); 
  
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

      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_type: adType,
          title,
          item_name: itemName || null,
          text, 
          price: price ? parseFloat(price) : null,
          address: address || null, 
          status: "DRAFT", 
          attachments: attachmentsArray, 
        }),
      });

      if (!res.ok) throw new Error("Nepodařilo se vytvořit inzerát");
      
      const createdAd = await res.json();

      // 3. Inicializace Stripe Checkoutu 
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId: createdAd.id,
          title: title,
        }),
      });

      const { url, error } = await checkoutRes.json();

      if (url) {
        
        window.location.href = url;
      } else {
        throw new Error(error || "Chyba při vytváření platby");
      }

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Něco se nepovedlo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-800">Nový inzerát</CardTitle>
          <p className=" text-slate-500 text-sm">Vystavení inzerátu stojí 2.00 USD</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select value={adType} onValueChange={setAdType}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ITEM">Předmět</SelectItem>
                    <SelectItem value="SERVICE">Služba</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Adresa</Label>
                <Input className="rounded-xl"value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Název inzerátu</Label>
              <Input className="rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>{adType === "ITEM" ? "Co prodáváte?" : "Název služby"}</Label>
              <Input className="rounded-xl" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea  value={text} onChange={(e) => setText(e.target.value)} className="min-h-[120px] rounded-xl" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cena (Kč)</Label>
                <Input className="rounded-xl" type="number" placeholder="Dohodou" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fotografie</Label>
                <Input 
                  className="rounded-xl cursor-pointer" 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(e.target.files)} 
                />
              </div>
            </div>

            {selectedFiles && selectedFiles.length > 0 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Vybráno fotografií k nahrání: {selectedFiles.length}
              </p>
            )}

            <Button disabled={isSubmitting} className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6 rounded-xl shadow-md transition-all">
              {isSubmitting ? "Zpracovávám..." : "Zaplatit a zveřejnit (2 USD)"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}