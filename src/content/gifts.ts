import type { Gift } from "@/types";

export const seedGifts: Omit<Gift, "id" | "sort_order">[] = [
  {
    slug: "lua-de-mel",
    title: "Cota da lua de mel",
    description: "Ajude a tornar nossa viagem dos sonhos realidade",
    price_cents: 15000,
    emoji: "✈️",
  },
  {
    slug: "jantar-romantico",
    title: "Jantar romântico",
    description: "Para nossas comemorações de aniversário",
    price_cents: 20000,
    emoji: "🍷",
  },
  {
    slug: "eletro-cozinha",
    title: "Eletrodoméstico de cozinha",
    description: "Liquidificador, batedeira ou airfryer",
    price_cents: 30000,
    emoji: "🍳",
  },
  {
    slug: "jogo-cama",
    title: "Jogo de cama king",
    description: "Para noites bem dormidas no nosso lar",
    price_cents: 25000,
    emoji: "🛏️",
  },
  {
    slug: "louca-mesa",
    title: "Louça e talheres",
    description: "Conjunto para nossas refeições especiais",
    price_cents: 40000,
    emoji: "🍽️",
  },
  {
    slug: "decoracao",
    title: "Decoração da casa",
    description: "Quadros, vasos e detalhes que fazem a diferença",
    price_cents: 18000,
    emoji: "🪴",
  },
  {
    slug: "presente-livre",
    title: "Presente livre",
    description: "Você escolhe o valor que quiser presentear",
    price_cents: 0,
    emoji: "💝",
  },
];
