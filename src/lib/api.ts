import { supabase } from "./supabase";
import type { Match, Player, TournamentResult } from "./types";

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from("players").select("*").order("points", { ascending: false }).order("wins", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase.from("matches").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTournaments(): Promise<TournamentResult[]> {
  const { data, error } = await supabase.from("tournaments").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function isAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return Boolean(data);
}
