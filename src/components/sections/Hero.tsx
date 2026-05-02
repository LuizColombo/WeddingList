"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Heart, Gift } from "lucide-react";
import { Button } from "@/components/ui/Button";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

interface HeroProps {
  brideAndGroom?: string;
  date?: string;
  location?: string;
}

export function Hero({
  brideAndGroom = "Maria & João",
  date = "20 de dezembro de 2026",
  location = "São Paulo, SP",
}: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent-2/15 blur-3xl" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-20 pt-24 text-center sm:pt-32"
      >
        <motion.div
          variants={item}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-accent"
        >
          <Heart className="h-3.5 w-3.5 fill-accent" />
          {date}
        </motion.div>

        <motion.h1
          variants={item}
          className="font-serif text-5xl leading-tight text-foreground sm:text-7xl"
        >
          {brideAndGroom}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-4 text-lg text-foreground/70"
        >
          {location}
        </motion.p>

        <motion.p
          variants={item}
          className="mt-8 max-w-xl text-balance text-base leading-relaxed text-foreground/80"
        >
          Sua presença é o nosso maior presente. Mas se quiser nos ajudar a
          construir essa nova fase, deixamos uma lista com algumas sugestões
          que vão direto pra nossa nova casa.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/list">
            <Button size="lg">
              <Gift className="h-4 w-4" />
              Ver lista de presentes
            </Button>
          </Link>
          <Link href="#como-funciona">
            <Button variant="outline" size="lg">
              Como funciona
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
