import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllPlayers,
  getChampionships,
  getSeasons,
  isAdmin,
} from "../lib/api";
import { supabase } from "../lib/supabase";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import type { Championship, Player, Season } from "../lib/types";

type AdminTab = "match" | "championship" | "players" | "seasons";

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AdminTab>("match");
  const [notice, setNotice] = useState("");

  const admin = useQuery({ queryKey: ["is-admin"], queryFn: isAdmin });
  const players = useQuery({ queryKey: ["all-players"], queryFn: getAllPlayers });
  const seasons = useQuery({ queryKey: ["seasons"], queryFn: getSeasons });
  const championships = useQuery({
    queryKey: ["championships"],
    queryFn: getChampionships,
  });

  const activePlayers = useMemo(
    () => (players.data ?? []).filter((player) => player.active),
    [players.data],
  );

  const activeSeason = seasons.data?.find((season) => season.status === "active");

  const [player1Id, setPlayer1Id] = useState("");
  const [player2Id, setPlayer2Id] = useState("");
  const [goals1, setGoals1] = useState(0);
  const [goals2, setGoals2] = useState(0);
  const [matchType, setMatchType] =
    useState<"friendly" | "championship">("friendly");
  const [seasonId, setSeasonId] = useState("");
  const [championshipId, setChampionshipId] = useState("");
  const [playedAt, setPlayedAt] = useState(
    new Date().toISOString().slice(0, 16),
  );

  const [championshipName, setChampionshipName] = useState("");
  const [championshipSeasonId, setChampionshipSeasonId] = useState("");
  const [championshipDate, setChampionshipDate] = useState(
    new Date().toISOString().slice(0, 16),
  );

  const [playerName, setPlayerName] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingPlayerName, setEditingPlayerName] = useState("");

  const [seasonName, setSeasonName] = useState("");
  const [seasonStartDate, setSeasonStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  useEffect(() => {
    if (activeSeason && !seasonId) setSeasonId(String(activeSeason.id));
    if (activeSeason && !championshipSeasonId) {
      setChampionshipSeasonId(String(activeSeason.id));
    }
  }, [activeSeason, seasonId, championshipSeasonId]);

  async function refreshAll() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["players"] }),
      queryClient.invalidateQueries({ queryKey: ["all-players"] }),
      queryClient.invalidateQueries({ queryKey: ["matches"] }),
      queryClient.invalidateQueries({ queryKey: ["seasons"] }),
      queryClient.invalidateQueries({ queryKey: ["championships"] }),
    ]);
  }

  const createMatch = useMutation({
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

      if (matchType === "championship" && !championshipId) {
        throw new Error("Selecione o campeonato.");
      }

      const { error } = await supabase.from("matches").insert({
        player1_id: Number(player1Id),
        player1_name: player1?.name,
        goals1,
        player2_id: Number(player2Id),
        player2_name: player2?.name,
        goals2,
        match_type: matchType,
        season_id: seasonId ? Number(seasonId) : null,
        championship_id:
          matchType === "championship" && championshipId
            ? Number(championshipId)
            : null,
        played_at: new Date(playedAt).toISOString(),
        summary:
          matchType === "friendly"
            ? "Amistoso oficial"
            : "Partida de campeonato",
      });

      if (error) throw error;
    },
    onSuccess: async () => {
      setNotice("Partida cadastrada.");
      setGoals1(0);
      setGoals2(0);
      await refreshAll();
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const createChampionship = useMutation({
    mutationFn: async () => {
      if (!championshipName.trim()) {
        throw new Error("Informe o nome do campeonato.");
      }

      const { error } = await supabase.from("championships").insert({
        name: championshipName.trim(),
        season_id: championshipSeasonId
          ? Number(championshipSeasonId)
          : null,
        played_at: new Date(championshipDate).toISOString(),
        status: "planned",
      });

      if (error) throw error;
    },
    onSuccess: async () => {
      setChampionshipName("");
      setNotice("Campeonato criado.");
      await refreshAll();
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const createPlayer = useMutation({
    mutationFn: async () => {
      if (!playerName.trim()) throw new Error("Informe o nome.");

      const { error } = await supabase.from("players").insert({
        name: playerName.trim(),
        active: true,
      });

      if (error) throw error;
    },
    onSuccess: async () => {
      setPlayerName("");
      setNotice("Jogador adicionado.");
      await refreshAll();
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const updatePlayer = useMutation({
    mutationFn: async () => {
      if (!editingPlayer) return;
      if (!editingPlayerName.trim()) throw new Error("Informe o nome.");

      const { error } = await supabase
        .from("players")
        .update({ name: editingPlayerName.trim() })
        .eq("id", editingPlayer.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      setEditingPlayer(null);
      setEditingPlayerName("");
      setNotice("Jogador atualizado.");
      await refreshAll();
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
    onSuccess: refreshAll,
    onError: (error: Error) => setNotice(error.message),
  });

  const removePlayer = useMutation({
    mutationFn: async (player: Player) => {
      if (!window.confirm(`Excluir ou desativar ${player.name}?`)) return null;

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
          ? "Jogador excluído."
          : "Jogador desativado para preservar o histórico.",
      );
      await refreshAll();
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const createSeason = useMutation({
    mutationFn: async () => {
      if (!seasonName.trim()) throw new Error("Informe o nome da temporada.");

      const { error: finishError } = await supabase
        .from("seasons")
        .update({
          status: "finished",
          end_date: new Date().toISOString().slice(0, 10),
        })
        .eq("status", "active");

      if (finishError) throw finishError;

      const { error } = await supabase.from("seasons").insert({
        name: seasonName.trim(),
        start_date: seasonStartDate,
        status: "active",
      });

      if (error) throw error;
    },
    onSuccess: async () => {
      setSeasonName("");
      setNotice("Nova temporada ativada.");
      await refreshAll();
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const finishChampionship = useMutation({
    mutationFn: async (championship: Championship) => {
      const { error } = await supabase
        .from("championships")
        .update({ status: "finished" })
        .eq("id", championship.id);

      if (error) throw error;
    },
    onSuccess: refreshAll,
    onError: (error: Error) => setNotice(error.message),
  });

  if (
    admin.isLoading ||
    players.isLoading ||
    seasons.isLoading ||
    championships.isLoading
  ) {
    return <Loading />;
  }

  if (!admin.data) {
    return (
      <ErrorBox message="Acesso negado. Entre com sua conta administradora." />
    );
  }

  return (
    <section className="lovable-admin">
      <div className="admin-title">
        <div className="admin-shield">♢</div>
        <div>
          <h1>Painel Admin</h1>
          <p>Gerencie partidas, campeonatos, jogadores e temporadas.</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={tab === "match" ? "active" : ""}
          onClick={() => setTab("match")}
        >
          Partida
        </button>
        <button
          className={tab === "championship" ? "active" : ""}
          onClick={() => setTab("championship")}
        >
          Campeonato
        </button>
        <button
          className={tab === "players" ? "active" : ""}
          onClick={() => setTab("players")}
        >
          Jogadores
        </button>
        <button
          className={tab === "seasons" ? "active" : ""}
          onClick={() => setTab("seasons")}
        >
          Temporadas
        </button>
      </div>

      {tab === "match" && (
        <div className="admin-two-column">
          <form
            className="admin-panel"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              createMatch.mutate();
            }}
          >
            <h2>＋ Nova partida</h2>

            <div className="form-grid">
              <label>
                Mandante
                <select
                  value={player1Id}
                  onChange={(event) => setPlayer1Id(event.target.value)}
                  required
                >
                  <option value="">—</option>
                  {activePlayers.map((player) => (
                    <option value={player.id} key={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Visitante
                <select
                  value={player2Id}
                  onChange={(event) => setPlayer2Id(event.target.value)}
                  required
                >
                  <option value="">—</option>
                  {activePlayers.map((player) => (
                    <option value={player.id} key={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Gols mandante
                <input
                  type="number"
                  min="0"
                  value={goals1}
                  onChange={(event) => setGoals1(Number(event.target.value))}
                />
              </label>

              <label>
                Gols visitante
                <input
                  type="number"
                  min="0"
                  value={goals2}
                  onChange={(event) => setGoals2(Number(event.target.value))}
                />
              </label>

              <label>
                Tipo
                <select
                  value={matchType}
                  onChange={(event) => {
                    setMatchType(
                      event.target.value as "friendly" | "championship",
                    );
                    if (event.target.value === "friendly") {
                      setChampionshipId("");
                    }
                  }}
                >
                  <option value="friendly">Amistoso</option>
                  <option value="championship">Campeonato</option>
                </select>
              </label>

              <label>
                Temporada
                <select
                  value={seasonId}
                  onChange={(event) => setSeasonId(event.target.value)}
                >
                  <option value="">Nenhuma</option>
                  {(seasons.data ?? []).map((season) => (
                    <option value={season.id} key={season.id}>
                      {season.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Campeonato
                <select
                  value={championshipId}
                  onChange={(event) => setChampionshipId(event.target.value)}
                  disabled={matchType === "friendly"}
                >
                  <option value="">Nenhum</option>
                  {(championships.data ?? [])
                    .filter((item) => item.status === "planned")
                    .map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Data
                <input
                  type="datetime-local"
                  value={playedAt}
                  onChange={(event) => setPlayedAt(event.target.value)}
                />
              </label>
            </div>

            <button className="primary-action" disabled={createMatch.isPending}>
              Cadastrar
            </button>
          </form>

          <div className="admin-panel admin-empty-panel">
            <span>Nenhuma partida selecionada.</span>
          </div>
        </div>
      )}

      {tab === "championship" && (
        <div className="admin-two-column">
          <form
            className="admin-panel"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              createChampionship.mutate();
            }}
          >
            <h2>＋ Novo campeonato</h2>

            <label>
              Nome
              <input
                value={championshipName}
                onChange={(event) => setChampionshipName(event.target.value)}
                placeholder="Ex.: Copa da Galera"
              />
            </label>

            <label>
              Temporada
              <select
                value={championshipSeasonId}
                onChange={(event) =>
                  setChampionshipSeasonId(event.target.value)
                }
              >
                <option value="">Nenhuma</option>
                {(seasons.data ?? []).map((season) => (
                  <option value={season.id} key={season.id}>
                    {season.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Data
              <input
                type="datetime-local"
                value={championshipDate}
                onChange={(event) => setChampionshipDate(event.target.value)}
              />
            </label>

            <button
              className="primary-action"
              disabled={createChampionship.isPending}
            >
              Criar campeonato
            </button>
          </form>

          <div className="admin-panel">
            <h2>Campeonatos</h2>

            <div className="management-list">
              {(championships.data ?? []).map((championship) => (
                <div className="management-row" key={championship.id}>
                  <div>
                    <strong>{championship.name}</strong>
                    <span>{championship.status}</span>
                  </div>

                  {championship.status === "planned" && (
                    <button
                      className="secondary-action"
                      onClick={() => finishChampionship.mutate(championship)}
                    >
                      Encerrar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "players" && (
        <div className="admin-two-column">
          <form
            className="admin-panel"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              createPlayer.mutate();
            }}
          >
            <h2>＋ Novo jogador</h2>

            <label>
              Nome
              <input
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
              />
            </label>

            <button className="primary-action">Adicionar jogador</button>
          </form>

          <div className="admin-panel">
            <h2>Jogadores</h2>

            <div className="management-list">
              {(players.data ?? []).map((player) => (
                <div className="management-row" key={player.id}>
                  <div>
                    <strong>{player.name}</strong>
                    <span>{player.active ? "Ativo" : "Desativado"}</span>
                  </div>

                  <div className="row-actions">
                    <button
                      className="secondary-action"
                      onClick={() => {
                        setEditingPlayer(player);
                        setEditingPlayerName(player.name);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="secondary-action"
                      onClick={() => togglePlayer.mutate(player)}
                    >
                      {player.active ? "Desativar" : "Reativar"}
                    </button>
                    <button
                      className="danger-action"
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
      )}

      {tab === "seasons" && (
        <div className="admin-two-column">
          <form
            className="admin-panel"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              createSeason.mutate();
            }}
          >
            <h2>＋ Nova temporada</h2>

            <label>
              Nome
              <input
                value={seasonName}
                onChange={(event) => setSeasonName(event.target.value)}
                placeholder="Ex.: Temporada 2"
              />
            </label>

            <label>
              Data inicial
              <input
                type="date"
                value={seasonStartDate}
                onChange={(event) => setSeasonStartDate(event.target.value)}
              />
            </label>

            <button className="primary-action">Criar e ativar</button>
          </form>

          <div className="admin-panel">
            <h2>Temporadas</h2>

            <div className="management-list">
              {(seasons.data ?? []).map((season: Season) => (
                <div className="management-row" key={season.id}>
                  <div>
                    <strong>{season.name}</strong>
                    <span>{season.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editingPlayer && (
        <div className="admin-modal-backdrop">
          <form
            className="admin-modal"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              updatePlayer.mutate();
            }}
          >
            <h2>Editar jogador</h2>

            <label>
              Nome
              <input
                value={editingPlayerName}
                onChange={(event) => setEditingPlayerName(event.target.value)}
              />
            </label>

            <div className="row-actions">
              <button className="primary-action">Salvar</button>
              <button
                type="button"
                className="secondary-action"
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
