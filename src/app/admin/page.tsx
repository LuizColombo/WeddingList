import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { getDb } from "@/lib/db";
import { getSession, isAdminCpf } from "@/lib/session";
import { AdminTable } from "./AdminTable";
import { GiftAdmin } from "./GiftAdmin";
import type { Gift, TransactionWithUser } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (!isAdminCpf(session.cpf)) redirect("/list");

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT t.id, t.user_id, t.amount_cents, t.gift_slug, t.message,
              t.status, t.created_at, t.confirmed_at,
              u.name AS user_name, u.cpf AS user_cpf
       FROM transactions t
       JOIN users u ON u.id = t.user_id
       ORDER BY
         CASE t.status WHEN 'pending' THEN 0 WHEN 'confirmed' THEN 1 ELSE 2 END,
         t.created_at DESC`
    )
    .all() as TransactionWithUser[];

  const totals = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN status='confirmed' THEN amount_cents END), 0) AS confirmed,
         COALESCE(SUM(CASE WHEN status='pending'   THEN amount_cents END), 0) AS pending,
         COUNT(*) AS total
       FROM transactions`
    )
    .get() as { confirmed: number; pending: number; total: number };

  const gifts = db
    .prepare(
      `SELECT id, slug, title, description, price_cents, emoji, sort_order
       FROM gifts ORDER BY sort_order ASC, id ASC`
    )
    .all() as Gift[];

  const giftMap = Object.fromEntries(gifts.map((g) => [g.slug, g.title]));

  return (
    <>
      <Navbar userName={session.name} isAdmin />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-8">
          <h1 className="font-serif text-4xl text-foreground">Admin</h1>
          <p className="mt-1 text-foreground/60">
            Confira os pagamentos no extrato e marque como confirmado.
          </p>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Confirmado" cents={totals.confirmed} highlight />
          <Stat label="Pendente" cents={totals.pending} />
          <Stat label="Total de transações" count={totals.total} />
        </div>

        <section className="mb-12">
          <h2 className="mb-4 font-serif text-2xl text-foreground">
            Transações
          </h2>
          <AdminTable rows={rows} giftMap={giftMap} />
        </section>

        <section>
          <h2 className="mb-4 font-serif text-2xl text-foreground">
            Itens da lista
          </h2>
          <GiftAdmin gifts={gifts} />
        </section>
      </main>
    </>
  );
}

function Stat({
  label,
  cents,
  count,
  highlight,
}: {
  label: string;
  cents?: number;
  count?: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-accent/30 bg-soft"
          : "border-border bg-card"
      }`}
    >
      <div className="text-xs uppercase tracking-wider text-foreground/60">
        {label}
      </div>
      <div className="mt-1 font-serif text-3xl text-foreground">
        {cents !== undefined
          ? (cents / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : count}
      </div>
    </div>
  );
}
