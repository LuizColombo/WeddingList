import Link from "next/link";
import { Gift, Heart, QrCode, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { getSession, isAdminCpf } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  return (
    <>
      <Navbar
        userName={session.name}
        isAdmin={isAdminCpf(session.cpf)}
      />
      <main>
        <Hero />

        <section
          id="como-funciona"
          className="mx-auto max-w-5xl px-6 py-20"
        >
          <div className="flex flex-col items-center text-center">
            <span className="ornament text-[0.7rem] uppercase tracking-[0.4em] text-accent-2">
              <span>Como funciona</span>
            </span>
            <h2 className="mt-4 font-serif text-4xl text-foreground sm:text-5xl">
              Simples, rápido e direto pelo Pix
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <Step
              n="01"
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Crie sua conta"
              text="Cadastre-se rapidinho com seu nome, CPF e uma senha."
            />
            <Step
              n="02"
              icon={<Gift className="h-5 w-5" />}
              title="Escolha um presente"
              text="Escolha uma das sugestões da nossa lista ou um valor livre."
            />
            <Step
              n="03"
              icon={<QrCode className="h-5 w-5" />}
              title="Pague via Pix"
              text="Geramos o QR Code e o copia-e-cola. Pague pelo seu banco preferido."
            />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-28 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent/20 bg-soft">
            <Heart className="h-6 w-6 fill-accent text-accent" />
          </div>
          <h2 className="mt-6 font-serif text-3xl text-foreground sm:text-4xl">
            Obrigado por fazer parte
          </h2>
          <p className="mt-4 text-foreground/70">
            Cada presente, mensagem e abraço significa muito pra gente.
          </p>
          <div className="mt-10">
            <Link
              href={session.userId ? "/list" : "/register"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent/90"
            >
              <Gift className="h-4 w-4" />
              {session.userId ? "Ver lista" : "Começar agora"}
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/70 py-10 text-center">
        <p className="font-script text-xl text-accent">Elisa & Luiz Henrique</p>
        <p className="mt-1 text-[0.7rem] uppercase tracking-[0.35em] text-foreground/50">
          12 . 12 . 2026
        </p>
      </footer>
    </>
  );
}

function Step({
  n,
  icon,
  title,
  text,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="card-elevated relative rounded-3xl border border-border bg-card p-7 transition-transform hover:-translate-y-1">
      <span className="absolute right-6 top-6 font-serif text-sm tracking-wider text-accent-2/70">
        {n}
      </span>
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-soft text-accent">
        {icon}
      </div>
      <h3 className="font-serif text-2xl text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/65">{text}</p>
    </div>
  );
}
