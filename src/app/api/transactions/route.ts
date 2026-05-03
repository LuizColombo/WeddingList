import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { pixFromEnv } from "@/lib/pix";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  const giftSlug = body.gift_slug ? String(body.gift_slug) : null;
  const customAmount = Number(body.amount_cents || 0);
  const message = body.message ? String(body.message).slice(0, 280) : null;

  const db = getDb();

  let amountCents = 0;
  if (giftSlug) {
    const gift = db
      .prepare("SELECT price_cents FROM gifts WHERE slug = ?")
      .get(giftSlug) as { price_cents: number } | undefined;
    if (!gift) {
      return NextResponse.json({ error: "Presente inválido" }, { status: 400 });
    }
    amountCents = gift.price_cents > 0 ? gift.price_cents : customAmount;
  } else {
    amountCents = customAmount;
  }

  if (!Number.isInteger(amountCents) || amountCents < 100) {
    return NextResponse.json(
      { error: "Valor mínimo de R$ 1,00" },
      { status: 400 }
    );
  }
  if (amountCents > 5000000) {
    return NextResponse.json(
      { error: "Valor acima do limite (R$ 50.000)" },
      { status: 400 }
    );
  }

  const result = db
    .prepare(
      `INSERT INTO transactions (user_id, amount_cents, gift_slug, message, status)
       VALUES (?, ?, ?, ?, 'pending')`
    )
    .run(session.userId, amountCents, giftSlug, message);

  const id = Number(result.lastInsertRowid);
  const pixCode = pixFromEnv(amountCents, `TX${id}`);

  return NextResponse.json({
    ok: true,
    id,
    amount_cents: amountCents,
    pix_code: pixCode,
  });
}
