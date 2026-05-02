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
          <div className="text-center">
            <h2 className="font-serif text-4xl text-foreground">
              Como funciona
            </h2>
            <p className="mt-3 text-foreground/60">
              Simples, rápido e direto pelo Pix
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Step
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Crie sua conta"
              text="Cadastre-se rapidinho com seu nome, CPF e uma senha."
            />
            <Step
              icon={<Gift className="h-6 w-6" />}
              title="Escolha um presente"
              text="Escolha uma das sugestões da nossa lista ou um valor livre."
            />
            <Step
              icon={<QrCode className="h-6 w-6" />}
              title="Pague via Pix"
              text="Geramos o QR Code e o copia-e-cola. Pague pelo seu banco preferido."
            />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
          <Heart className="mx-auto h-8 w-8 fill-accent text-accent" />
          <h2 className="mt-4 font-serif text-3xl text-foreground">
            Obrigado por fazer parte
          </h2>
          <p className="mt-3 text-foreground/70">
            Cada presente, mensagem e abraço significa muito pra gente.
          </p>
          <div className="mt-8">
            <Link
              href={session.userId ? "/list" : "/register"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
            >
              <Gift className="h-4 w-4" />
              {session.userId ? "Ver lista" : "Começar agora"}
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-xs text-foreground/50">
        Feito com 💝 pelos noivos
      </footer>
    </>
  );
}

function Step({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-soft text-accent">
        {icon}
      </div>
      <h3 className="font-serif text-xl text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-foreground/60">{text}</p>
    </div>
  );
}
