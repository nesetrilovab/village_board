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
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          /* TADY JE TA ZMĚNA: columns místo grid */
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
            {feed.length > 0 ? (
              feed.map((item) => (
                /* Přidán obalový div s 'break-inside-avoid', aby se karta nerozpůlila mezi sloupci */
                <div key={`${item.type}-${item.id}`} className="break-inside-avoid mb-6">
                  <FeedCard {...item} />
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-10 w-full">
                Zatím tu nejsou žádné příspěvky.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}