"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // OPRAVENO: Správný import pro App Router
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter(); // Inicializace routeru

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Hesla se neshodují.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registrace se nezdařila.");
        return;
      }

      // Úspěch!
      router.push("/login");
      // Malý trik: alert dej až po pushi, nebo raději vůbec, 
      // uživatel uvidí login stránku.
    } catch (err) {
      console.error(err);
      setError("Něco se nepovedlo, zkuste to znovu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-3xl border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-slate-900 text-center">
            Vytvořit účet
          </CardTitle>
          <p className="text-sm text-slate-500 text-center">Připojte se k naší obecní nástěnce</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="name">Jméno a příjmení</Label>
              <Input
                id="name"
                placeholder="Jan Novák"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jan.novak@email.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 h-11 mt-4"
            >
              {isLoading ? "Vytvářím účet..." : "Zaregistrovat se"}
            </Button>

            <p className="text-center text-sm text-slate-500 mt-2">
              Už máte účet? <a href="/login" className="text-blue-600 hover:underline font-medium">Přihlaste se</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}