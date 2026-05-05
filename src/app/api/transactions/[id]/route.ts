import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { pixFromEnv } from "@/lib/pix";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const txId = Number(id);
  if (!Number.isInteger(txId) || txId <= 0) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const db = getDb();
  const tx = db
    .prepare(
      `SELECT id, user_id, amount_cents, gift_slug, status
       FROM transactions WHERE id = ?`
    )
    .get(txId) as
    | {
        id: number;
        user_id: number;
        amount_cents: number;
        gift_slug: string | null;
        status: string;
      }
    | undefined;

  if (!tx) {
    return NextResponse.json(
      { error: "Transação não encontrada" },
      { status: 404 }
    );
  }
  if (tx.user_id !== session.userId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  if (tx.status !== "pending") {
    return NextResponse.json(
      { error: "Transação não está pendente" },
      { status: 409 }
    );
  }

  const pixCode = pixFromEnv(tx.amount_cents, `TX${tx.id}`);
  return NextResponse.json({
    id: tx.id,
    amount_cents: tx.amount_cents,
    gift_slug: tx.gift_slug,
    pix_code: pixCode,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const txId = Number(id);
  if (!Number.isInteger(txId) || txId <= 0) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const action = body?.action;
  if (action !== "cancel") {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  const db = getDb();
  const tx = db
    .prepare(
      `SELECT id, user_id, status FROM transactions WHERE id = ?`
    )
    .get(txId) as
    | { id: number; user_id: number; status: string }
    | undefined;

  if (!tx) {
    return NextResponse.json(
      { error: "Transação não encontrada" },
      { status: 404 }
    );
  }
  if (tx.user_id !== session.userId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  if (tx.status !== "pending") {
    return NextResponse.json(
      { error: "Só é possível cancelar transações pendentes" },
      { status: 409 }
    );
  }

  db.prepare(
    `UPDATE transactions SET status = 'cancelled' WHERE id = ?`
  ).run(txId);

  return NextResponse.json({ ok: true });
}
