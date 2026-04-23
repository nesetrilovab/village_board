"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/feed"); // Předpokládám tuhle cestu
        router.refresh(); // Důležité, aby se aktualizoval Navbar s přihlášeným uživatelem
      } else {
        const data = await res.json();
        setError(data.message || "Špatný email nebo heslo");
      }
    } catch (err) {
      setError("Server neodpovídá, zkuste to později.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-3xl border-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-slate-900 text-center">
            Vítejte zpět
          </CardTitle>
          <p className="text-sm text-slate-500 text-center">Přihlaste se ke svému účtu</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan.novak@obec.cz"
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold transition-all"
            >
              {isLoading ? "Ověřování..." : "Přihlásit se"}
            </Button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Nemáte účet? <a href="/register" className="text-blue-600 hover:underline">Zaregistrujte se</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}