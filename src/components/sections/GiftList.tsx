"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Heart } from "lucide-react";
import { gifts } from "@/content/gifts";
import { PixModal } from "@/components/ui/PixModal";
import { formatBRL, formatDate } from "@/lib/utils";
import type { Gift, Transaction } from "@/types";

interface GiftListProps {
  myTransactions: Transaction[];
}

export function GiftList({ myTransactions }: GiftListProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Gift | null>(null);

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
            className="group flex flex-col rounded-3xl border border-border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 text-4xl">{gift.emoji}</div>
            <h3 className="font-serif text-xl text-foreground">
              {gift.title}
            </h3>
            <p className="mt-1 flex-1 text-sm text-foreground/60">
              {gift.description}
            </p>
            <div className="mt-4 flex items-end justify-between">
              <div className="text-xs uppercase tracking-wider text-foreground/50">
                {gift.price_cents > 0 ? "Valor sugerido" : "Valor livre"}
              </div>
              <div className="font-serif text-2xl text-accent">
                {gift.price_cents > 0 ? formatBRL(gift.price_cents) : "—"}
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Presentear →
            </div>
          </motion.button>
        ))}
      </div>

      {myTransactions.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl text-foreground">
            Seus presentes
          </h2>
          <p className="mt-1 text-sm text-foreground/60">
            Histórico das suas contribuições
          </p>
          <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {myTransactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-accent" />
                    <span className="font-medium">
                      {gifts.find((g) => g.slug === tx.gift_slug)?.title ||
                        "Presente"}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-foreground/50">
                    {formatDate(tx.created_at)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-lg text-foreground">
                    {formatBRL(tx.amount_cents)}
                  </div>
                  <StatusBadge status={tx.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PixModal
        open={!!selected}
        gift={selected}
        onClose={() => setSelected(null)}
        onCreated={() => router.refresh()}
      />
    </>
  );
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Confirmado
      </span>
    );
  }
  if (status === "cancelled") {
    return <span className="text-xs text-foreground/50">Cancelado</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-700">
      <Clock className="h-3 w-3" />
      Pendente
    </span>
  );
}
