"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  userName?: string;
  isAdmin?: boolean;
}

export function Navbar({ userName, isAdmin }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl text-accent"
        >
          <Heart className="h-5 w-5 fill-accent" />
          <span>Nosso Casamento</span>
        </Link>

        <nav className="flex items-center gap-2">
          {userName ? (
            <>
              <span className="hidden text-sm text-foreground/70 sm:inline">
                Olá, {userName.split(" ")[0]}
              </span>
              <Link href="/list">
                <Button variant="ghost" size="sm">
                  Lista
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Criar conta</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
