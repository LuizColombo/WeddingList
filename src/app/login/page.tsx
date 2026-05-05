"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { formatCPF } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Erro ao entrar");
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
          className="mb-8 flex flex-col items-center gap-2 text-accent"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-soft font-serif text-base tracking-tight">
            E<span className="mx-0.5 text-accent-2">&</span>L
          </span>
          <span className="font-serif text-lg">
            Elisa <span className="font-script text-accent-2">&</span> Luiz Henrique
          </span>
        </Link>
        <div className="card-elevated rounded-3xl border border-border bg-card p-8">
          <h1 className="font-serif text-2xl text-foreground">Entrar</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Use seu CPF e senha cadastrados
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
            <PasswordInput
              label="Senha"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/60">
            Ainda não tem conta?{" "}
            <Link
              href="/register"
              className="font-medium text-accent hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
