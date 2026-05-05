"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Gift } from "lucide-react";
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
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

interface HeroProps {
  bride?: string;
  groom?: string;
  date?: string;
  dateLong?: string;
}

export function Hero({
  bride = "Elisa",
  groom = "Luiz Henrique",
  date = "12 . 12 . 2026",
  dateLong = "Sábado, 12 de dezembro de 2026",
}: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent-2/15 blur-3xl" />
        <div className="absolute top-1/3 left-0 h-64 w-64 rounded-full bg-soft blur-3xl" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-24 text-center sm:pt-32"
      >
        <motion.div variants={item} className="ornament text-[0.7rem] uppercase tracking-[0.4em]">
          <span>{date}</span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-8 font-serif text-6xl leading-[1.05] text-foreground sm:text-8xl"
        >
          {bride}
          <span className="mx-3 align-middle font-script text-accent sm:mx-5">&</span>
          {groom}
        </motion.h1>

        <motion.div
          variants={item}
          className="mt-8 flex items-center gap-4 text-foreground/60"
        >
          <span className="h-px w-10 bg-accent-2/60" />
          <span className="font-serif text-base italic sm:text-lg">
            {dateLong}
          </span>
          <span className="h-px w-10 bg-accent-2/60" />
        </motion.div>

        <motion.p
          variants={item}
          className="mt-10 max-w-xl text-balance text-base leading-relaxed text-foreground/75"
        >
          Sua presença é o nosso maior presente. Mas se quiser nos ajudar a
          construir essa nova fase, deixamos uma lista com algumas sugestões
          que vão direto pra nossa nova casa.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
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
