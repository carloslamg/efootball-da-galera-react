import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllPlayers, isAdmin } from "../lib/api";
import { supabase } from "../lib/supabase";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import type { Player } from "../lib/types";

export default function AdminPage() {
  const queryClient = useQueryClient();

  const admin = useQuery({
    queryKey: ["is-admin"],
    queryFn: isAdmin,
  });

  const players = useQuery({
    queryKey: ["all-players"],
    queryFn: getAllPlayers,
  });

  const [player1Id, setPlayer1Id] = useState("");
  const [player2Id, setPlayer2Id] = useState("");
  const [goals1, setGoals1] = useState(0);
  const [goals2, setGoals2] = useState(0);
  const [summary, setSummary] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingName, setEditingName] = useState("");
  const [notice, setNotice] = useState("");

  const activePlayers = useMemo(
    () => (players.data ?? []).filter((player) => player.active),
    [players.data],
  );

  async function refreshPlayers() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["all-players"] }),
      queryClient.invalidateQueries({ queryKey: ["players"] }),
    ]);
  }

  const addMatch = useMutation({
    mutationFn: async () => {
      if (!player1Id || !player2Id || player1Id === player2Id) {
        throw new Error("Escolha jogadores diferentes.");
      }

      const player1 = players.data?.find(
        (player) => String(player.id) === player1Id,
      );
      const player2 = players.data?.find(
        (player) => String(player.id) === player2Id,
      );

      const { error } = await supabase.from("matches").insert({
        player1_id: Number(player1Id),
        player1_name: player1?.name,
        goals1,
        player2_id: Number(player2Id),
        player2_name: player2?.name,
        goals2,
        summary: summary.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: async () => {
      setNotice("Partida cadastrada.");
      setGoals1(0);
      setGoals2(0);
      setSummary("");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["matches"] }),
        refreshPlayers(),
      ]);
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const addPlayer = useMutation({
    mutationFn: async () => {
      const name = newPlayerName.trim();
      if (!name) throw new Error("Informe o nome do jogador.");

      const { error } = await supabase.from("players").insert({
        name,
        active: true,
      });

      if (error) throw error;
    },
    onSuccess: async () => {
      setNewPlayerName("");
      setNotice("Jogador adicionado.");
      await refreshPlayers();
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const renamePlayer = useMutation({
    mutationFn: async () => {
      if (!editingPlayer) return;

      const name = editingName.trim();
      if (!name) throw new Error("Informe o novo nome.");

      const { error } = await supabase
        .from("players")
        .update({ name })
        .eq("id", editingPlayer.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      setEditingPlayer(null);
      setEditingName("");
      setNotice("Nome atualizado.");
      await refreshPlayers();
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const togglePlayer = useMutation({
    mutationFn: async (player: Player) => {
      const { error } = await supabase
        .from("players")
        .update({ active: !player.active })
        .eq("id", player.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      setNotice("Situação do jogador atualizada.");
      await refreshPlayers();
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const removePlayer = useMutation({
    mutationFn: async (player: Player) => {
      const confirmed = window.confirm(
        `Remover ${player.name}? Se ele tiver partidas ou pontos, será apenas desativado para preservar o histórico.`,
      );

      if (!confirmed) return null;

      const { data, error } = await supabase.rpc("delete_player_safely", {
        _player_id: player.id,
      });

      if (error) throw error;
      return data as "deleted" | "deactivated";
    },
    onSuccess: async (result) => {
      if (!result) return;

      setNotice(
        result === "deleted"
          ? "Jogador excluído permanentemente."
          : "O jogador tinha histórico e foi desativado.",
      );

      await refreshPlayers();
    },
    onError: (error: Error) => setNotice(error.message),
  });

  if (admin.isLoading || players.isLoading) return <Loading />;

  if (!admin.data) {
    return (
      <ErrorBox message="Acesso negado. Entre com sua conta administradora." />
    );
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Gestão</span>
          <h1>Painel Admin</h1>
        </div>
      </div>

      <div className="admin-grid">
        <form
          className="panel"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            addMatch.mutate();
          }}
        >
          <h2>Cadastrar partida</h2>

          <label>
            Jogador 1
            <select
              value={player1Id}
              onChange={(event) => setPlayer1Id(event.target.value)}
              required
            >
              <option value="">Selecione</option>
              {activePlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Jogador 2
            <select
              value={player2Id}
              onChange={(event) => setPlayer2Id(event.target.value)}
              required
            >
              <option value="">Selecione</option>
              {activePlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>

          <div className="two-cols">
            <label>
              Gols 1
              <input
                type="number"
                min="0"
                value={goals1}
                onChange={(event) => setGoals1(Number(event.target.value))}
              />
            </label>

            <label>
              Gols 2
              <input
                type="number"
                min="0"
                value={goals2}
                onChange={(event) => setGoals2(Number(event.target.value))}
              />
            </label>
          </div>

          <label>
            Resumo
            <input
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Opcional"
            />
          </label>

          <button disabled={addMatch.isPending}>Cadastrar partida</button>
        </form>

        <div className="panel">
          <h2>Gerenciar jogadores</h2>

          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              addPlayer.mutate();
            }}
          >
            <label>
              Novo jogador
              <input
                value={newPlayerName}
                onChange={(event) => setNewPlayerName(event.target.value)}
                placeholder="Nome"
              />
            </label>

            <button disabled={addPlayer.isPending}>Adicionar jogador</button>
          </form>

          <div className="player-management-list">
            {(players.data ?? []).map((player) => (
              <div className="player-management-row" key={player.id}>
                <div>
                  <strong>{player.name}</strong>
                  <span>{player.active ? "Ativo" : "Desativado"}</span>
                </div>

                <div className="player-actions">
                  <button
                    type="button"
                    className="small-button"
                    onClick={() => {
                      setEditingPlayer(player);
                      setEditingName(player.name);
                    }}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="small-button"
                    onClick={() => togglePlayer.mutate(player)}
                  >
                    {player.active ? "Desativar" : "Reativar"}
                  </button>

                  <button
                    type="button"
                    className="small-button danger-button"
                    onClick={() => removePlayer.mutate(player)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingPlayer && (
        <div className="modal-backdrop">
          <form
            className="modal-card"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              renamePlayer.mutate();
            }}
          >
            <h2>Editar jogador</h2>

            <label>
              Nome
              <input
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
              />
            </label>

            <div className="modal-actions">
              <button type="submit">Salvar</button>
              <button
                type="button"
                className="small-button"
                onClick={() => setEditingPlayer(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {notice && <div className="notice">{notice}</div>}
    </section>
  );
}
