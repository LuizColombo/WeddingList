import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession, isAdminCpf } from "@/lib/session";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId || !isAdminCpf(session.cpf)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;
  const giftId = Number(id);
  if (!Number.isInteger(giftId) || giftId <= 0) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const db = getDb();
  const result = db.prepare("DELETE FROM gifts WHERE id = ?").run(giftId);
  if (result.changes === 0) {
    return NextResponse.json(
      { error: "Item não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
