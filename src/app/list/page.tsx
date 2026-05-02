import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GiftList } from "@/components/sections/GiftList";
import { getDb } from "@/lib/db";
import { getSession, isAdminCpf } from "@/lib/session";
import type { Transaction } from "@/types";

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

  return (
    <>
      <Navbar
        userName={session.name}
        isAdmin={isAdminCpf(session.cpf)}
      />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-serif text-4xl text-foreground sm:text-5xl">
            Lista de presentes
          </h1>
          <p className="mt-3 text-foreground/70">
            Escolha um item da lista. Você gera o Pix na hora e o pagamento cai
            direto na conta dos noivos.
          </p>
        </header>
        <GiftList myTransactions={myTransactions} />
      </main>
    </>
  );
}
