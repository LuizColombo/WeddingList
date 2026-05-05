"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Heart, Loader2, QrCode, X } from "lucide-react";
import { PixModal } from "@/components/ui/PixModal";
import { Button } from "@/components/ui/Button";
import { formatBRL, formatDate } from "@/lib/utils";
import type { Gift, Transaction } from "@/types";

interface GiftListProps {
  gifts: Gift[];
  myTransactions: Transaction[];
}

export function GiftList({ gifts, myTransactions }: GiftListProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Gift | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Transaction | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [viewing, setViewing] = useState<{
    gift: Gift;
    existing: { id: number; amount_cents: number; pix_code: string };
  } | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);

  const giftsBySlug = useMemo(
    () => new Map(gifts.map((g) => [g.slug, g])),
    [gifts]
  );

  const visibleTx = showCancelled
    ? myTransactions
    : myTransactions.filter((tx) => tx.status !== "cancelled");

  const cancelledCount = myTransactions.filter(
    (tx) => tx.status === "cancelled"
  ).length;

  async function handleViewPix(tx: Transaction) {
    const gift = tx.gift_slug ? giftsBySlug.get(tx.gift_slug) : null;
    if (!gift) return;
    setViewError(null);
    setViewingId(tx.id);
    try {
      const res = await fetch(`/api/transactions/${tx.id}`);
      const data = await res.json();
      if (!res.ok) {
        setViewError(data.error || "Erro ao carregar Pix");
        return;
      }
      setViewing({
        gift,
        existing: {
          id: data.id,
          amount_cents: data.amount_cents,
          pix_code: data.pix_code,
        },
      });
    } catch {
      setViewError("Erro de conexão");
    } finally {
      setViewingId(null);
    }
  }

  async function handleCancel(tx: Transaction) {
    setCancellingId(tx.id);
    try {
      const res = await fetch(`/api/transactions/${tx.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (res.ok) {
        setConfirmCancel(null);
        router.refresh();
      }
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {gifts.map((gift, i) => (
          <motion.button
            key={gift.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelected(gift)}
            className="card-elevated group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 text-left transition-all hover:border-accent/30"
          >
            <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-soft text-3xl">
              {gift.emoji}
            </div>
            <h3 className="font-serif text-2xl text-foreground">
              {gift.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/65">
              {gift.description}
            </p>
            <div className="mt-6 flex items-end justify-between border-t border-border/60 pt-4">
              <div className="text-[0.65rem] uppercase tracking-[0.25em] text-foreground/45">
                {gift.price_cents > 0 ? "Valor sugerido" : "Valor livre"}
              </div>
              <div className="font-serif text-2xl text-accent">
                {gift.price_cents > 0 ? formatBRL(gift.price_cents) : "—"}
              </div>
            </div>
            <div className="mt-3 text-xs font-medium tracking-wider text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Presentear →
            </div>
          </motion.button>
        ))}
      </div>

      {myTransactions.length > 0 && (
        <section className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="ornament text-[0.7rem] uppercase tracking-[0.4em] text-accent-2">
                <span>Seus presentes</span>
              </span>
              <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
                Histórico das suas contribuições
              </h2>
            </div>
            {cancelledCount > 0 && (
              <button
                type="button"
                onClick={() => setShowCancelled((v) => !v)}
                className="text-xs font-medium text-foreground/60 underline-offset-4 hover:text-accent hover:underline"
              >
                {showCancelled
                  ? "Ocultar cancelados"
                  : `Mostrar cancelados (${cancelledCount})`}
              </button>
            )}
          </div>

          <ul className="mt-8 space-y-3">
            <AnimatePresence initial={false}>
              {visibleTx.map((tx) => {
                const gift = tx.gift_slug
                  ? giftsBySlug.get(tx.gift_slug)
                  : null;
                const isCancelled = tx.status === "cancelled";
                return (
                  <motion.li
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className={`card-elevated rounded-2xl border border-border bg-card p-5 ${
                      isCancelled ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-soft text-2xl">
                          {gift?.emoji || "🎁"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-serif text-lg text-foreground">
                              {gift?.title || "Presente"}
                            </span>
                            <StatusBadge status={tx.status} />
                          </div>
                          <div className="mt-1 text-xs text-foreground/50">
                            {formatDate(tx.created_at)} · #{tx.id}
                          </div>
                          {tx.message && (
                            <p className="mt-2 line-clamp-2 rounded-lg bg-soft/60 px-3 py-2 text-xs italic text-foreground/70">
                              “{tx.message}”
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-xl text-foreground">
                          {formatBRL(tx.amount_cents)}
                        </div>
                      </div>
                    </div>

                    {tx.status === "pending" && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                        <p className="flex items-center gap-2 text-xs text-foreground/60">
                          <Heart className="h-3.5 w-3.5 text-accent" />
                          Aguardando confirmação do pagamento.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewPix(tx)}
                            disabled={viewingId === tx.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-soft px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-60"
                          >
                            {viewingId === tx.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <QrCode className="h-3.5 w-3.5" />
                            )}
                            Ver Pix
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmCancel(tx)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </section>
      )}

      <PixModal
        open={!!selected}
        gift={selected}
        onClose={() => setSelected(null)}
        onCreated={() => router.refresh()}
      />

      <PixModal
        open={!!viewing}
        gift={viewing?.gift ?? null}
        existing={viewing?.existing ?? null}
        onClose={() => setViewing(null)}
      />

      {viewError && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-xs font-medium text-white shadow-lg">
          {viewError}
        </div>
      )}

      <ConfirmCancelModal
        tx={confirmCancel}
        gift={
          confirmCancel?.gift_slug
            ? giftsBySlug.get(confirmCancel.gift_slug) ?? null
            : null
        }
        loading={cancellingId === confirmCancel?.id}
        onClose={() => setConfirmCancel(null)}
        onConfirm={() => confirmCancel && handleCancel(confirmCancel)}
      />
    </>
  );
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[0.7rem] font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Confirmado
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[0.7rem] font-medium text-foreground/55">
        Cancelado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[0.7rem] font-medium text-amber-800">
      <Clock className="h-3 w-3" />
      Pendente
    </span>
  );
}

function ConfirmCancelModal({
  tx,
  gift,
  loading,
  onClose,
  onConfirm,
}: {
  tx: Transaction | null;
  gift: Gift | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {tx && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-2xl"
          >
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <X className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-serif text-2xl text-foreground">
                Cancelar contribuição?
              </h3>
              <p className="mt-2 text-sm text-foreground/65">
                {gift ? (
                  <>
                    Você vai cancelar{" "}
                    <span className="font-medium text-foreground">
                      {gift.title}
                    </span>{" "}
                    no valor de{" "}
                    <span className="font-medium text-foreground">
                      {formatBRL(tx.amount_cents)}
                    </span>
                    . Se já pagou o Pix, fale com os noivos antes de cancelar.
                  </>
                ) : (
                  "Esta ação não pode ser desfeita."
                )}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Voltar
              </Button>
              <Button
                className="flex-1 !bg-red-600 hover:!bg-red-600/90"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Cancelar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
