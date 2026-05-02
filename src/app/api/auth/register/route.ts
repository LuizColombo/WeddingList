import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { isValidCPF, sanitizeCPF } from "@/lib/cpf";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  const name = String(body.name || "").trim();
  const cpf = sanitizeCPF(String(body.cpf || ""));
  const password = String(body.password || "");

  if (name.length < 2) {
    return NextResponse.json({ error: "Informe seu nome" }, { status: 400 });
  }
  if (!isValidCPF(cpf)) {
    return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Senha deve ter pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE cpf = ?").get(cpf);
  if (existing) {
    return NextResponse.json(
      { error: "CPF já cadastrado, faça login" },
      { status: 409 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
  const result = db
    .prepare("INSERT INTO users (cpf, name, password_hash) VALUES (?, ?, ?)")
    .run(cpf, name, hash);

  const session = await getSession();
  session.userId = Number(result.lastInsertRowid);
  session.cpf = cpf;
  session.name = name;
  await session.save();

  return NextResponse.json({ ok: true });
}
