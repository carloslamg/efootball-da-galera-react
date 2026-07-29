import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "../lib/api";
import Loading from "../components/Loading";
import type { TournamentResult } from "../lib/types";

type LiveTournament = TournamentResult & {
  starts_at?: string | null;
  ends_at?: string | null;
  status?: "agendado" | "em_andamento" | "finalizado" | null;
  format?: "pontos_corridos" | "mata_mata" | "grupos_mata_mata" | null;
  home_and_away?: boolean | null;
  participants?: string[] | null;
  notes?: string | null;
};

function formatDate(date?: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date.slice(0, 10)}T00:00:00`));
}

function formatStatus(status?: LiveTournament["status"]) {
  if (status === "em_andamento") return "Em andamento";
  if (status === "finalizado") return "Finalizado";
  if (status === "agendado") return "Agendado";
  return "Não informado";
}

function formatTournamentType(format?: LiveTournament["format"]) {
  if (format === "pontos_corridos") return "Pontos corridos";
  if (format === "mata_mata") return "Mata-mata";
  if (format === "grupos_mata_mata") return "Grupos + mata-mata";
  return "Formato não informado";
}

export default function TournamentsPage() {
  const query = useQuery({
    queryKey: ["tournaments"],
    queryFn: getTournaments,
  });

  if (query.isLoading) return <Loading />;

  if (query.isError) {
    return (
      <section>
        <div className="page-heading">
          <div>
            <span className="eyebrow">Erro</span>
            <h1>Campeonatos</h1>
          </div>
        </div>

        <article className="tournament-card">
          <p>Não foi possível carregar os campeonatos.</p>
        </article>
      </section>
    );
  }

  const tournaments = (query.data ?? []) as LiveTournament[];

  const activeTournaments = tournaments.filter(
    (tournament) =>
      tournament.status === "em_andamento" ||
      tournament.status === "agendado",
  );

  const historicalRows = tournaments.filter(
    (tournament) =>
      tournament.status === "finalizado" ||
      Boolean(tournament.placement || tournament.player_name),
  );

  const groupedHistory = Object.values(
    historicalRows.reduce<Record<string, LiveTournament[]>>(
      (accumulator, row) => {
        const key = row.name || "Campeonato";
        if (!accumulator[key]) accumulator[key] = [];
        accumulator[key].push(row);
        return accumulator;
      },
      {},
    ),
  );

  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Competição oficial</span>
          <h1>Campeonatos</h1>
        </div>
      </div>

      {activeTournaments.length > 0 ? (
        <>
          <div className="page-heading">
            <div>
              <span className="eyebrow">Ao vivo</span>
              <h2>Campeonato em andamento</h2>
            </div>
          </div>

          <div className="card-grid">
            {activeTournaments.map((tournament) => (
              <article className="tournament-card" key={tournament.id}>
                <span className="eyebrow">
                  🏆 {formatStatus(tournament.status)}
                </span>

                <h3>{tournament.name ?? "Campeonato"}</h3>

                <div className="podium-text">
                  <span>Início</span>
                  <strong>{formatDate(tournament.starts_at)}</strong>
                </div>

                <div className="podium-text">
                  <span>Fim previsto</span>
                  <strong>{formatDate(tournament.ends_at)}</strong>
                </div>

                <div className="podium-text">
                  <span>Formato</span>
                  <strong>
                    {formatTournamentType(tournament.format)}
                    {tournament.home_and_away ? " · Ida e volta" : ""}
                  </strong>
                </div>

                <div className="podium-text">
                  <span>Participantes</span>
                  <strong>{tournament.participants?.length ?? 0}</strong>
                </div>

                {tournament.notes && <p>{tournament.notes}</p>}
              </article>
            ))}
          </div>
        </>
      ) : (
        <article className="tournament-card">
          <h3>Nenhum campeonato em andamento</h3>
          <p>O próximo campeonato aparecerá aqui quando for criado.</p>
        </article>
      )}

      {groupedHistory.length > 0 && (
        <>
          <div className="page-heading">
            <div>
              <span className="eyebrow">Resultados anteriores</span>
              <h2>Histórico</h2>
            </div>
          </div>

          <div className="card-grid">
            {groupedHistory.map((rows) => (
              <article
                className="tournament-card"
                key={rows[0]?.name ?? rows[0]?.id}
              >
                <h3>{rows[0]?.name ?? "Campeonato"}</h3>

                {rows.map((row) => (
                  <div className="podium-text" key={row.id}>
                    <span>
                      {row.placement ?? "Participação"}:{" "}
                      {row.player_name ?? "—"}
                    </span>
                    <strong>{row.points ?? 0} pts</strong>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
