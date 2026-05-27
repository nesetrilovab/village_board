"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    async function checkUser() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    }
    checkUser();
  }, [pathname]); 

  const handleLogout = async () => {
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
        
        <Link href="/feed" className="text-2xl font-black tracking-tighter text-slate-800">
          VillageBoard
        </Link>

        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/feed" className={linkStyle("/feed")}>Board</Link>
          {user && (
            <>
              <Link href="/articles/create" className={linkStyle("/articles/create")}>Article</Link>
              <Link href="/events/create" className={linkStyle("/events/create")}>Event</Link>
              <Link href="/ads/create" className={linkStyle("/ads/create")}>Advertisement</Link>
              <Link href="/drafts" className={linkStyle("/drafts")}>Drafts</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 italic">
                {user.email} {user.role === "ADMIN" && ""}
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-red-500 hover:text-red-700 transition"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className={linkStyle("/login")}>Log in</Link>
              <Link href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}