"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  // Načtení uživatele při načtení stránky
  useEffect(() => {
    async function checkUser() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    }
    checkUser();
  }, [pathname]); // Zkontroluje uživatele při každé změně stránky

  const handleLogout = async () => {
    // Pro logout stačí zavolat endpoint, který smaže cookie, nebo ji smazat tady
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const linkStyle = (path: string) => 
    `transition-colors hover:text-blue-600 ${
      pathname === path ? "text-blue-600 font-bold" : "text-gray-600"
    }`;

  return (
    <nav className="w-full bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        <Link href="/feed" className="text-2xl font-black tracking-tighter text-blue-600">
          Village<span className="text-slate-800">Board</span>
        </Link>

        {/* Hlavní Navigace - Viditelná jen pro přihlášené (volitelně) */}
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/feed" className={linkStyle("/feed")}>Nástěnka</Link>
          {user && (
            <>
              <Link href="/articles/create" className={linkStyle("/articles/create")}>Nový článek</Link>
              <Link href="/events/create" className={linkStyle("/events/create")}>Akce</Link>
              <Link href="/ads/create" className={linkStyle("/ads/create")}>Inzerát</Link>
              <Link href="/drafts" className={linkStyle("/drafts")}>Koncepty</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            /* Zobrazení pro PŘIHLÁŠENÉHO uživatele */
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 italic">
                {user.email} {user.role === "ADMIN" && ""}
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-red-500 hover:text-red-700 transition"
              >
                Odhlásit se
              </button>
            </div>
          ) : (
            /* Zobrazení pro NEPŘIHLÁŠENÉHO */
            <>
              <Link href="/login" className={linkStyle("/login")}>Přihlásit se</Link>
              <Link href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition">
                Registrace
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}