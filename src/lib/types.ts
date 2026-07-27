export type Player = {
  id: number;
  name: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  titles: number;
};

export type Match = {
  id: number;
  player1_id: number | null;
  player1_name: string | null;
  goals1: number | null;
  player2_id: number | null;
  player2_name: string | null;
  goals2: number | null;
  summary: string | null;
  created_at: string;
};

export type TournamentResult = {
  id: number;
  name: string | null;
  player_id: number | null;
  player_name: string | null;
  placement: string | null;
  points: number | null;
  created_at: string;
};

export type RankingRow = Player;
