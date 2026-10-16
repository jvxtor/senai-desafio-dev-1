// Tipos do contrato da API. Os nomes dos campos seguem o snake_case do backend.

export type Position = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';
export type Condition = 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE';
export type Formation = '3-1' | '2-2' | '2-1-1' | '1-2-1';
export type TransactionType = 'COMPRA' | 'VENDA';
export type MatchResult = 'MANDANTE' | 'VISITANTE' | 'EMPATE';

export type PlayerSort = 'name' | 'value_asc' | 'value_desc' | 'age_asc' | 'age_desc' | 'position';
export type ClubSort = 'name' | 'net_worth_asc' | 'net_worth_desc';

/* Jogadores */

export interface Player {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  condition: Condition;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
}

export interface PlayersPage {
  data: Player[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface PlayersFilters {
  search?: string;
  position?: Position;
  condition?: Condition;
  free?: boolean;
  club_id?: number;
  min_age?: number;
  max_age?: number;
  min_value?: number;
  max_value?: number;
  /** Até dois critérios separados por vírgula, como "position,age_desc". */
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreatePlayerInput {
  name: string;
  position: Position;
  agility: number;
  age: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
}

export type UpdatePlayerInput = Pick<CreatePlayerInput, 'name' | 'position' | 'agility' | 'age'>;

/* Clubes */

export interface Club {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface SquadPlayer extends Player {
  contract: {
    purchase_value: number;
    loyalty_until: string;
    remaining_days: number;
    penalty_rate: number;
  };
}

export interface ClubDetail extends Club {
  players: SquadPlayer[];
}

export interface CreateClubInput {
  name: string;
  acronym: string;
}

/* Mercado */

export interface Transaction {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TransactionType;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

export interface TransactionSummary {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
}

export interface TransactionsResult {
  data: Transaction[];
  summary: TransactionSummary;
}

export interface TransactionsFilters {
  type?: TransactionType[];
  player_id?: number;
}

export interface BuyPlayerInput {
  club_id: number;
  /** Já no formato da API: AAAA-MM-DDTHH:MM-03:00. Use toApiDateTime. */
  loyalty_until: string;
}

export interface PurchaseResult extends Transaction {
  contract: {
    purchase_value: number;
    loyalty_until: string;
    status: 'ATIVO';
  };
  club_cash: number;
}

export interface SaleResult extends Transaction {
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: 'RESCINDIDO' | 'ENCERRADO';
  club_cash: number;
}

/* Liga */

export interface Lineup {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: Player[];
}

export interface SetLineupInput {
  formation: Formation;
  player_ids: number[];
}

export interface MatchSide {
  club_id: number;
  club_name: string;
  formation: Formation;
  goals: number;
}

export interface MatchSummary {
  id: number;
  played_at: string;
  home: MatchSide;
  away: MatchSide;
  result: MatchResult;
}

export interface DuelParticipant {
  player_id: number;
  player_name: string;
  position: Position;
  condition: Condition;
  attribute: 'shooting' | 'passing' | 'dribbling' | 'defending';
  value: number;
}

export interface Duel {
  order: number;
  attacking_club_id: number;
  attacker: DuelParticipant;
  defender: DuelParticipant;
  goal: boolean;
}

export interface Match extends MatchSummary {
  duels: Duel[];
}

export interface PlayMatchInput {
  home_club_id: number;
  away_club_id: number;
}

export interface Standing {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}
