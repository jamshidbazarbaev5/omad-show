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
  store: {
    id: number;
    name: string;
    address: string;
  };
  name: string;
  description: string;
  status?: string;
  all_clients?: boolean;
  from_bonus?: number;
  to_bonus?: number;
  prizes?: Prize[];
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
  type: "item" | "money";
  image?: File | string | null;
  quantity: number;
  ordering: number;
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
  client: {
    id: number;
    full_name: string;
    phone_number: string;
  };
  amount: string;
  created_at: string;
  updated_at?: string;
  bonus_awarded: number;
  is_active: boolean;
  created_by: {
    id: number;
    full_name: string;
    phone_number: string;
  };
  store: {
    id: number;
    name: string;
    address: string;
    created_at: string;
  };
}

export interface Participant {
  id: number;
  full_name: string;
  phone_number: string;
  total_bonuses: number;
}

export interface GameParticipants {
  game_status: string;
  participants_count: number;
  next: string | null;
  previous: string | null;
  participants: Participant[];
}

export interface Winner {
  id: number;
  prize: {
    id: number;
    name: string;
    image: string;
    type: "item" | "money";
  };
  client: {
    id: number;
    full_name: string;
    phone_number: string;
  };
  awarded_at: string;
}

export interface GameWinners {
  game: string;
  total_winners: number;
  next: string | null;
  previous: string | null;
  winners: Winner[];
}
