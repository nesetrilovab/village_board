"use client";

import { useEffect, useState } from "react";
import FeedCard from "@/components/ui/feedcard";

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch("/api/feed");
        const data = await res.json();
        setFeed(data);
      } catch (error) {
        console.error("Chyba při načítání feedu:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeed();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="p-6 max-w-[1600px] mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Vesnická nástěnka
          </h1>
          <p className="text-slate-500 text-sm mt-2">Aktuální dění, akce a inzerce z naší obce</p>
        </header>

        {isLoading ? (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
) : feed.length > 0 ? (
  <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
    {feed.map((item) => (
      <div key={`${item.type}-${item.id}`} className="break-inside-avoid mb-6">
        <FeedCard {...item} />
      </div>
    ))}
  </div>
) : (
  <div className="text-center py-20 bg-white rounded-2xl shadow-sm max-w-md mx-auto border border-slate-100">
    <p className="text-slate-500 font-medium">
      Zatím tu nejsou žádné příspěvky.
    </p>
  </div>
)}
      </main>
    </div>
  );
}