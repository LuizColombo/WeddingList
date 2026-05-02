import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: number;
  cpf?: string;
  name?: string;
}

const password = process.env.SESSION_PASSWORD;
if (!password || password.length < 32) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_PASSWORD must be set and at least 32 characters in production"
    );
  }
}

export const sessionOptions: SessionOptions = {
  password: password || "dev-only-insecure-password-change-me-please-32",
  cookieName: "wedding_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  },
};

export async function getSession() {
  const c = await cookies();
  return getIronSession<SessionData>(c, sessionOptions);
}

export function isAdminCpf(cpf: string | undefined): boolean {
  if (!cpf) return false;
  const adminCpf = (process.env.ADMIN_CPF || "").replace(/\D/g, "");
  if (!adminCpf) return false;
  return cpf.replace(/\D/g, "") === adminCpf;
}
