import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession, isAdminCpf } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || !isAdminCpf(session.cpf)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const slug = String(body.slug || "").trim();
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim().slice(0, 200);
  const emoji = String(body.emoji || "🎁").trim().slice(0, 4) || "🎁";
  const priceCents = Number(body.price_cents);

  if (title.length < 2 || title.length > 80) {
    return NextResponse.json(
      { error: "Título deve ter entre 2 e 80 caracteres" },
      { status: 400 }
    );
  }
  if (!/^[a-z0-9-]+$/.test(slug) || slug.length > 60) {
    return NextResponse.json(
      { error: "Slug inválido (use letras minúsculas, números e hífen)" },
      { status: 400 }
    );
  }
  if (
    !Number.isInteger(priceCents) ||
    priceCents < 0 ||
    priceCents > 5000000
  ) {
    return NextResponse.json(
      { error: "Valor inválido" },
      { status: 400 }
    );
  }

  const db = getDb();
  const exists = db.prepare("SELECT id FROM gifts WHERE slug = ?").get(slug);
  if (exists) {
    return NextResponse.json(
      { error: "Já existe um item com esse slug" },
      { status: 409 }
    );
  }

  const nextOrder = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM gifts")
    .get() as { n: number };

  const result = db
    .prepare(
      `INSERT INTO gifts (slug, title, description, price_cents, emoji, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(slug, title, description, priceCents, emoji, nextOrder.n);

  return NextResponse.json({ ok: true, id: Number(result.lastInsertRowid) });
}
