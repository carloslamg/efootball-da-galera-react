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
  active: boolean;
};

export type Season = {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  status: "upcoming" | "active" | "finished";
  created_at: string;
};

export type Championship = {
  id: number;
  name: string;
  season_id: number | null;
  status: "planned" | "finished";
  played_at: string;
  created_at: string;
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
  played_at: string;
  match_type: "friendly" | "championship";
  season_id: number | null;
  championship_id: number | null;
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
