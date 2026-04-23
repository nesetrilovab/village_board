"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Trash2, Edit3, ArrowLeft } from "lucide-react";

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Načtení dat příspěvku a přihlášeného uživatele zároveň
    const fetchData = async () => {
      try {
        const [resPost, resUser] = await Promise.all([
          fetch(`/api/feed/${id}`),
          fetch("/api/auth/me")
        ]);

        if (resPost.ok) setData(await resPost.json());
        if (resUser.ok) setUser(await resUser.json());
      } catch (err) {
        console.error("Chyba při načítání:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Opravdu chcete tento příspěvek smazat?")) return;
    
    const res = await fetch(`/api/feed/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/feed");
      router.refresh();
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Načítání...</div>;
  if (!data) return <div className="p-10 text-center">Příspěvek nenalezen.</div>;

  const isOwner = user?.userId === data.author_id;
  const isAdmin = user?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Tlačítko zpět a Admin akce */}
      <div className="sticky top-16 bg-white/80 backdrop-blur-md z-40 border-b">
        <div className="max-w-4xl mx-auto px-6 py-3 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft size={18} /> Zpět
          </Button>
          
          {canEdit && (
            <div className="flex gap-2">
              <Button 
  variant="outline" 
  size="sm" 
  className="gap-2"
  onClick={() => {
    // Dynamicky určíme cestu podle typu příspěvku
    if (data.type === "ARTICLE") {
      router.push(`/articles/edit/${id}`);
    } else if (data.type === "EVENT") {
      router.push(`/events/edit/${id}`);
    } else if (data.type === "AD") {
      router.push(`/ads/edit/${id}`);
    }
  }}
>
  <Edit3 size={16} /> Upravit
</Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                <Trash2 size={16} /> Smazat
              </Button>
            </div>
          )}
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 pt-10">
        {/* Hlavička */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {data.type === "ARTICLE" ? "Článek" : data.type === "EVENT" ? "Akce" : "Inzerát"}
            </Badge>
            {data.status === "DRAFT" && (
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Koncept</Badge>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {data.title}
          </h1>
          
          {data.subtitle && (
            <p className="text-xl text-slate-500 font-medium">{data.subtitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-slate-500 border-y py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <User size={16} />
              </div>
              <span className="font-semibold text-slate-900">{data.author?.name || "Neznámý autor"}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              {new Date(data.created_at).toLocaleDateString("cs-CZ")}
            </div>

            {data.location && (
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                {data.location}
              </div>
            )}
          </div>
        </div>

        {/* Hlavní obrázek */}
        {(data.cover_image || data.picture) && (
          <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-10 shadow-2xl">
            <img src={data.cover_image || data.picture} alt={data.title} className="w-full h-auto rounded-3xl" />
          </div>
        )}

        {/* Tělo textu */}
        <div className="prose prose-slate prose-lg max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed text-slate-800">
            {data.text || data.description}
          </div>
        </div>

        {/* Specifické info pro Inzeráty (cena) */}
        {data.type === "AD" && data.price && (
          <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
            <span className="text-blue-900 font-bold text-lg">Cena</span>
            <span className="text-3xl font-black text-blue-600">{data.price} Kč</span>
          </div>
        )}

        {/* Specifické info pro Akce (datum a adresa) */}
        {data.type === "EVENT" && (
          <div className="mt-10 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-emerald-800 text-sm font-bold uppercase tracking-wider">Kdy</span>
              <span className="text-lg text-emerald-900 font-semibold">
                {new Date(data.event_date).toLocaleString("cs-CZ", { dateStyle: "long", timeStyle: "short" })}
              </span>
            </div>
            <div>
              <span className="block text-emerald-800 text-sm font-bold uppercase tracking-wider">Kde</span>
              <span className="text-lg text-emerald-900 font-semibold">{data.address}</span>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}