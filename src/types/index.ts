export interface User {
  id: number;
  cpf: string;
  name: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount_cents: number;
  gift_slug: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  confirmed_at: string | null;
}

export interface TransactionWithUser extends Transaction {
  user_name: string;
  user_cpf: string;
}

export interface Gift {
  id: number;
  slug: string;
  title: string;
  description: string;
  price_cents: number;
  emoji: string;
  sort_order: number;
}
