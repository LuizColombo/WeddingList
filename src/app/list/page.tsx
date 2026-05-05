import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GiftList } from "@/components/sections/GiftList";
import { getDb } from "@/lib/db";
import { getSession, isAdminCpf } from "@/lib/session";
import type { Gift, Transaction } from "@/types";

export const dynamic = "force-dynamic";

export default async function ListPage() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const db = getDb();
  const myTransactions = db
    .prepare(
      `SELECT id, user_id, amount_cents, gift_slug, message, status,
              created_at, confirmed_at
       FROM transactions
       WHERE user_id = ?
       ORDER BY created_at DESC`
    )
    .all(session.userId) as Transaction[];

  const gifts = db
    .prepare(
      `SELECT id, slug, title, description, price_cents, emoji, sort_order
       FROM gifts ORDER BY sort_order ASC, id ASC`
    )
    .all() as Gift[];

  return (
    <>
      <Navbar
        userName={session.name}
        isAdmin={isAdminCpf(session.cpf)}
      />
      <main className="mx-auto max-w-6xl px-6 py-14">
        <header className="mb-12 max-w-2xl">
          <span className="ornament text-[0.7rem] uppercase tracking-[0.4em] text-accent-2">
            <span>Elisa & Luiz Henrique</span>
          </span>
          <h1 className="mt-5 font-serif text-5xl text-foreground sm:text-6xl">
            Lista de presentes
          </h1>
          <p className="mt-4 text-foreground/70">
            Escolha um item da lista. Você gera o Pix na hora e o pagamento cai
            direto na conta dos noivos.
          </p>
        </header>
        <GiftList gifts={gifts} myTransactions={myTransactions} />
      </main>
    </>
  );
}
