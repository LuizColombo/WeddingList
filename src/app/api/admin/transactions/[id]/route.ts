import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession, isAdminCpf } from "@/lib/session";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId || !isAdminCpf(session.cpf)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;
  const txId = Number(id);
  if (!Number.isInteger(txId) || txId <= 0) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (status !== "confirmed" && status !== "cancelled" && status !== "pending") {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const db = getDb();
  const confirmed_at = status === "confirmed" ? new Date().toISOString() : null;
  const result = db
    .prepare(
      `UPDATE transactions SET status = ?, confirmed_at = ? WHERE id = ?`
    )
    .run(status, confirmed_at, txId);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
