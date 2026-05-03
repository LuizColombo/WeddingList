"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatBRL, slugify } from "@/lib/utils";
import type { Gift } from "@/types";

interface GiftAdminProps {
  gifts: Gift[];
}

export function GiftAdmin({ gifts }: GiftAdminProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🎁");
  const [priceReais, setPriceReais] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const computedSlug = slugTouched ? slug : slugify(title);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const finalSlug = computedSlug.trim();
    if (title.trim().length < 2) {
      setError("Informe um título");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(finalSlug)) {
      setError("Slug inválido (use apenas letras, números e hífen)");
      return;
    }
    const reais = priceReais.trim()
      ? Number(priceReais.replace(",", "."))
      : 0;
    if (!Number.isFinite(reais) || reais < 0) {
      setError("Valor sugerido inválido");
      return;
    }

    setCreating(true);
    const res = await fetch("/api/admin/gifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: finalSlug,
        title: title.trim(),
        description: description.trim(),
        price_cents: Math.round(reais * 100),
        emoji: emoji.trim() || "🎁",
      }),
    });
    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(data.error || "Erro ao criar");
      return;
    }

    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setEmoji("🎁");
    setPriceReais("");
    router.refresh();
  }

  async function handleDelete(g: Gift) {
    if (!confirm(`Remover "${g.title}" da lista?`)) return;
    setDeletingId(g.id);
    const res = await fetch(`/api/admin/gifts/${g.id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Erro ao remover");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <h3 className="mb-4 font-medium">Adicionar item</h3>
        <div className="grid gap-3 sm:grid-cols-6">
          <div className="sm:col-span-1">
            <Input
              label="Emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
              maxLength={4}
            />
          </div>
          <div className="sm:col-span-3">
            <Input
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={80}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Valor sugerido (R$, vazio = livre)"
              inputMode="decimal"
              placeholder="150,00"
              value={priceReais}
              onChange={(e) => setPriceReais(e.target.value)}
            />
          </div>
          <div className="sm:col-span-4">
            <Input
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              maxLength={200}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Slug"
              value={computedSlug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="auto a partir do título"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={creating}>
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Adicionar
          </Button>
        </div>
      </form>

      {gifts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-foreground/50">
          Nenhum item na lista
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-foreground/60">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-right">Valor sugerido</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {gifts.map((g) => (
                <tr key={g.id}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{g.emoji}</span>
                      <div>
                        <div className="font-medium">{g.title}</div>
                        {g.description && (
                          <div className="max-w-md truncate text-xs text-foreground/50">
                            {g.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-foreground/60">
                    {g.slug}
                  </td>
                  <td className="p-4 text-right">
                    {g.price_cents > 0 ? formatBRL(g.price_cents) : "Livre"}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(g)}
                      disabled={deletingId === g.id}
                    >
                      {deletingId === g.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
