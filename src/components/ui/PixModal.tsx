"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatBRL } from "@/lib/utils";
import type { Gift } from "@/types";

interface ExistingTx {
  id: number;
  amount_cents: number;
  pix_code: string;
}

interface PixModalProps {
  open: boolean;
  onClose: () => void;
  gift: Gift | null;
  existing?: ExistingTx | null;
  onCreated?: () => void;
}

export function PixModal({
  open,
  onClose,
  gift,
  existing,
  onCreated,
}: PixModalProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [amountCents, setAmountCents] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPixCode(null);
      setTransactionId(null);
      setCustomAmount("");
      setMessage("");
      setError(null);
      setCopied(false);
      setAmountCents(0);
      return;
    }
    if (existing) {
      setPixCode(existing.pix_code);
      setTransactionId(existing.id);
      setAmountCents(existing.amount_cents);
    }
  }, [open, existing]);

  if (!gift) return null;

  const isCustom = gift.price_cents === 0;
  const isViewing = !!existing;

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const amount = isCustom
        ? Math.round(parseFloat(customAmount.replace(",", ".")) * 100)
        : gift!.price_cents;

      if (!Number.isFinite(amount) || amount < 100) {
        setError("Informe um valor mínimo de R$ 1,00");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gift_slug: gift!.slug,
          amount_cents: amount,
          message: message || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao gerar Pix");
        setLoading(false);
        return;
      }

      setPixCode(data.pix_code);
      setTransactionId(data.id);
      setAmountCents(data.amount_cents);
      onCreated?.();
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-foreground/50 hover:bg-muted"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mb-2 text-4xl">{gift.emoji}</div>
              <h3 className="font-serif text-2xl text-foreground">
                {gift.title}
              </h3>
              <p className="mt-1 text-sm text-foreground/60">
                {isViewing ? "Pix da sua contribuição pendente" : gift.description}
              </p>
            </div>

            {!pixCode ? (
              <div className="mt-6 space-y-4">
                {isCustom && (
                  <div>
                    <label className="text-sm font-medium text-foreground/80">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="100,00"
                      className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground/80">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 280))}
                    placeholder="Felicidades pro casal!"
                    rows={3}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                {!isCustom && (
                  <div className="rounded-xl bg-soft p-4 text-center">
                    <div className="text-xs uppercase tracking-wider text-foreground/60">
                      Valor sugerido
                    </div>
                    <div className="font-serif text-3xl text-accent">
                      {formatBRL(gift.price_cents)}
                    </div>
                  </div>
                )}

                {error && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Gerar Pix
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="flex justify-center rounded-2xl bg-white p-4">
                  <QRCodeSVG value={pixCode} size={220} level="M" />
                </div>

                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider text-foreground/60">
                    Total
                  </div>
                  <div className="font-serif text-3xl text-accent">
                    {formatBRL(amountCents)}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-foreground/60">
                    Pix copia e cola
                  </label>
                  <div className="mt-1 flex gap-2">
                    <code className="flex-1 truncate rounded-lg bg-muted p-3 text-xs">
                      {pixCode}
                    </code>
                    <Button onClick={handleCopy} variant="outline" size="md">
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <p className="rounded-lg bg-soft p-3 text-xs text-foreground/70">
                  Após o pagamento o status fica como <strong>pendente</strong>{" "}
                  até confirmarmos manualmente no extrato. Transação #
                  {transactionId}.
                </p>

                <Button onClick={onClose} variant="outline" className="w-full">
                  Fechar
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
