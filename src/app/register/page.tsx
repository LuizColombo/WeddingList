"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCPF } from "@/lib/utils";
import { isValidCPF } from "@/lib/cpf";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidCPF(cpf)) {
      setError("CPF inválido");
      return;
    }
    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, cpf, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Erro ao cadastrar");
      return;
    }
    router.push("/list");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-serif text-xl text-accent"
        >
          <Heart className="h-5 w-5 fill-accent" />
          Nosso Casamento
        </Link>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="font-serif text-2xl text-foreground">Criar conta</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Pra você poder presentear e acompanhar
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input
              label="Nome completo"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
            <Input
              label="CPF"
              name="cpf"
              inputMode="numeric"
              autoComplete="username"
              placeholder="000.000.000-00"
              value={formatCPF(cpf)}
              onChange={(e) =>
                setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
              }
              required
            />
            <Input
              label="Senha (mín. 6 caracteres)"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar conta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/60">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              Entre aqui
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
