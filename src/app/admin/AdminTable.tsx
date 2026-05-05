"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Clock, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatBRL, formatCPF, formatDate } from "@/lib/utils";
import type { TransactionWithUser } from "@/types";

interface AdminTableProps {
  rows: TransactionWithUser[];
  giftMap: Record<string, string>;
}

export function AdminTable({ rows, giftMap }: AdminTableProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function update(id: number, status: "confirmed" | "cancelled" | "pending") {
    setBusyId(id);
    await fetch(`/api/admin/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-foreground/50">
        Nenhuma transação ainda
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase tracking-wider text-foreground/60">
          <tr>
            <th className="p-4">Convidado</th>
            <th className="p-4">Presente</th>
            <th className="p-4 text-right">Valor</th>
            <th className="p-4">Status</th>
            <th className="p-4">Data</th>
            <th className="p-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((tx) => (
            <tr key={tx.id}>
              <td className="p-4">
                <div className="font-medium">{tx.user_name}</div>
                <div className="text-xs text-foreground/50">
                  {formatCPF(tx.user_cpf)}
                </div>
              </td>
              <td className="p-4">
                <div>
                  {tx.gift_slug ? giftMap[tx.gift_slug] || tx.gift_slug : "—"}
                </div>
                {tx.message && (
                  <div className="mt-0.5 max-w-xs truncate text-xs italic text-foreground/60">
                    “{tx.message}”
                  </div>
                )}
              </td>
              <td className="p-4 text-right font-medium">
                {formatBRL(tx.amount_cents)}
              </td>
              <td className="p-4">
                <StatusPill status={tx.status} />
              </td>
              <td className="p-4 text-xs text-foreground/60">
                {formatDate(tx.created_at)}
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  {tx.status === "cancelled" ? (
                    <span className="text-xs italic text-foreground/45">
                      Cancelado pelo convidado
                    </span>
                  ) : (
                    <>
                      {tx.status !== "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => update(tx.id, "confirmed")}
                          disabled={busyId === tx.id}
                        >
                          {busyId === tx.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          Confirmar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => update(tx.id, "cancelled")}
                        disabled={busyId === tx.id}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: TransactionWithUser["status"];
}) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Confirmado
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
        Cancelado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
      <Clock className="h-3 w-3" />
      Pendente
    </span>
  );
}
