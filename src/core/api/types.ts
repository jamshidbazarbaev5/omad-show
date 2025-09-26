export interface Color {
  id: number;
  name: string;
}

export interface Store {
  id: number;
  name: string;
  address: string;
}

export interface Employee {
  id: number;
  phone_number: string;
  full_name: string;
  role: "superadmin" | "store_admin" | "seller";
  store?: number;
  password?: string;
  store_read?: {
    id: number;
    name: string;
    address: string;
  };
}

export interface Game {
  id?: number;
  store: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
  store_read?: {
    id: number;
    name: string;
    address: string;
  };
}

export interface Prize {
  id?: number;
  game: number;
  name: string;
  image?: File | string | null;
  quantity: number;
  game_read?: {
    id: number;
    name: string;
    store: number;
  };
}

export interface BonusRange {
  id?: number;
  store: number;
  min_amount: number;
  max_amount: number;
  bonus_points: number;
  store_read?: {
    id: number;
    name: string;
    address: string;
  };
}

export interface Client {
  id?: number;
  phone_number: string;
  full_name: string;
}

export interface Purchase {
  id?: number;
  // client: number;
  amount: number;
  created_at?: string;
  updated_at?: string;
  client?: {
    id: number;
    phone_number: string;
    full_name: string;
  };
}
