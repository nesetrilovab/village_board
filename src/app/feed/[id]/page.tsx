"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  User,
  Trash2,
  Edit3,
  ArrowLeft,
  FileText,
  Download,
  Tag,
  Info
} from "lucide-react";
import ReviewsSection from "@/components/ui/reviewsSection"; // Opravená cesta k tvé nové komponentě

interface Attachment {
  id: string;
  filename: string;
  url: string;
}

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const fetchData = async () => {
      try {
        const [resPost, resUser] = await Promise.all([
          fetch(`/api/feed/${id}`),
          fetch("/api/auth/me") // Tvoje routa vracející přihlášeného uživatele
        ]);

        if (resPost.ok) setData(await resPost.json());
        if (resUser.ok) setUser(await resUser.json());
      } catch (err) {
        console.error("Error while loading:", err);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const res = await fetch(`/api/feed/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/feed");
      router.refresh();
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading...</div>;
  if (!data) return <div className="p-10 text-center text-slate-500">Post could not be found.</div>;

  const isOwner = user?.userId === data.author_id;
  const isAdmin = user?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;

  // Proměnné pro ReviewsSection předávané z načtených API dat
  const currentUserId = user?.userId || null;
  const isAuthor = data.author_id === currentUserId;
  const reviews = data.reviews || []; // API routa nám vrátí recenze v tomhle poli

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const images = data.attachments?.filter((att: Attachment) =>
    imageExtensions.includes(att.filename.split('.').pop()?.toLowerCase() || '')
  ) || [];

  const documents = data.attachments?.filter((att: Attachment) =>
    !imageExtensions.includes(att.filename.split('.').pop()?.toLowerCase() || '')
  ) || [];

  const typeConfig = {
    ARTICLE: { label: "Article", badgeStyle: "bg-blue-50 text-blue-700 border-blue-200" },
    EVENT: { label: "Event", badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    AD: { label: "Ad", badgeStyle: "bg-amber-50 text-amber-700 border-amber-200" }
  };

  const currentType = typeConfig[data.type as keyof typeof typeConfig] || typeConfig.ARTICLE;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
      <Card className="rounded-3xl shadow-sm border-slate-100 overflow-hidden bg-white">
        <div className="bg-slate-50/50 pb-10">
          <div className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 shadow-sm">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
              <Button variant="ghost" onClick={() => router.push("/feed")} className="gap-2 rounded-xl text-slate-600 hover:text-slate-900">
                <ArrowLeft size={18} /> Back to board
              </Button>

              {canEdit && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700"
                    onClick={() => {
                      if (data.type === "ARTICLE") router.push(`/articles/edit/${id}`);
                      else if (data.type === "EVENT") router.push(`/events/edit/${id}`);
                      else if (data.type === "AD") router.push(`/ads/edit/${id}`);
                    }}
                  >
                    <Edit3 size={16} /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2 rounded-xl">
                    <Trash2 size={16} /> Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-6 sm:p-10 space-y-8">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`${currentType.badgeStyle} font-bold px-3 py-1 text-xs uppercase tracking-wider rounded-lg`}>
                {currentType.label}
              </Badge>
              {data.status === "DRAFT" && (
                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 font-bold px-3 py-1 text-xs uppercase tracking-wider rounded-lg">
                  Draft
                </Badge>
              )}
              {data.ad_type && (
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium rounded-lg">
                  {data.ad_type === "ITEM" ? "Item" : "Service"}
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {data.title}
              </h1>
              {data.subtitle && (
                <p className="text-lg sm:text-xl text-slate-500 font-medium leading-relaxed border-l-4 border-slate-200 pl-4">
                  {data.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm text-slate-500 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                  {data.author?.name ? data.author.name[0] : <User size={15} />}
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Published by</p>
                  <p className="font-semibold text-slate-800">{data.author?.name || "Anonymous"}</p>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-200/50 text-slate-600 rounded-xl">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Date of publication</p>
                  <p className="font-semibold text-slate-800">
                    {data.date_of_release ? new Date(data.date_of_release).toLocaleDateString("cs-CZ") : new Date(data.created_at).toLocaleDateString("cs-CZ")}
                  </p>
                </div>
              </div>

              {data.address && (
                <>
                  <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-200/50 text-slate-600 rounded-xl">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Address</p>
                      <p className="font-semibold text-slate-800">{data.address}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {data.type === "AD" && (
              <div className="p-5 bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500 text-white rounded-xl shadow-sm"><Tag size={20} /></div>
                  <div>
                    <h3 className="font-bold text-slate-800">{data.item_name || "Item"}</h3>
                    <p className="text-xs text-slate-500">Price offered by seller</p>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 bg-white px-5 py-2 rounded-xl border border-amber-100 shadow-sm w-full sm:w-auto text-center">
                  {data.price ? `${data.price} Kč` : "Up for negotiation"}
                </div>
              </div>
            )}

            {data.type === "EVENT" && data.event_date && (
              <div className="p-5 bg-linear-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-sm"><Info size={20} /></div>
                  <div>
                    <h3 className="font-bold text-slate-800">Date</h3>
                  </div>
                </div>
                <div className="text-base sm:text-lg font-bold text-emerald-800 bg-white px-4 py-2.5 rounded-xl border border-emerald-100 shadow-sm w-full sm:w-auto text-center">
                  {new Date(data.event_date).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
                </div>
              </div>
            )}

            <div className="prose prose-slate prose-lg max-w-none pt-2">
              <div className="whitespace-pre-wrap leading-relaxed text-slate-800 text-base sm:text-lg">
                {data.text}
              </div>
            </div>

            {images.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Gallery ({images.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((img: Attachment) => (
                    <div key={img.id} className="relative aspect-video w-full rounded-2xl overflow-hidden group shadow-sm border border-slate-100 bg-slate-50">
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate font-medium">{img.filename}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  Attachments
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documents.map((doc: Attachment) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      download={doc.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-white text-slate-500 rounded-lg border group-hover:text-blue-600 transition-colors shadow-sm">
                          <FileText size={18} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 truncate pr-2 group-hover:text-slate-900">
                          {doc.filename}
                        </span>
                      </div>
                      <Download size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </div>

        {/* Sekce recenzí se vykreslí na konci, pokud jde o inzerát (AD) */}
        {data.type === "AD" && (
          <div className="p-6 sm:p-10 border-t border-slate-100 bg-white">
            <ReviewsSection
              reviews={reviews}
              adId={data.id}
              currentUserId={currentUserId}
              isAuthor={isAuthor}
              onUpdate={fetchData}
            />
          </div>
        )}
      </Card>
    </main>
  );
}