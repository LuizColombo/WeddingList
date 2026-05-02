import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { sanitizeCPF } from "@/lib/cpf";
import { getSession } from "@/lib/session";

interface UserRow {
  id: number;
  cpf: string;
  name: string;
  password_hash: string;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  const cpf = sanitizeCPF(String(body.cpf || ""));
  const password = String(body.password || "");

  if (!cpf || !password) {
    return NextResponse.json({ error: "Informe CPF e senha" }, { status: 400 });
  }

  const db = getDb();
  const user = db
    .prepare("SELECT id, cpf, name, password_hash FROM users WHERE cpf = ?")
    .get(cpf) as UserRow | undefined;

  if (!user) {
    return NextResponse.json({ error: "CPF ou senha incorretos" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "CPF ou senha incorretos" }, { status: 401 });
  }

  const session = await getSession();
  session.userId = user.id;
  session.cpf = user.cpf;
  session.name = user.name;
  await session.save();

  return NextResponse.json({ ok: true });
}
