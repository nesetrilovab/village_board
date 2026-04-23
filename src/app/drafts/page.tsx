"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Calendar, ShoppingBag, ArrowRight } from "lucide-react";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/drafts")
      .then(res => res.json())
      .then(data => {
        setDrafts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-10 text-center text-slate-500">Načítání vašich konceptů...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Moje rozpracované koncepty</h1>
      
      {drafts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl">
          <p className="text-slate-500">Nemáte žádné uložené koncepty.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft: any) => (
            <Link 
              key={draft.id} 
              href={`/feed/${draft.id}`}
              className="group bg-white border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  {draft.type === "ARTICLE" && <FileText size={24} />}
                  {draft.type === "EVENT" && <Calendar size={24} />}
                  {draft.type === "AD" && <ShoppingBag size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {draft.title || "Bez názvu"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Vytvořeno: {new Date(draft.created_at).toLocaleDateString("cs-CZ")}
                  </p>
                </div>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}