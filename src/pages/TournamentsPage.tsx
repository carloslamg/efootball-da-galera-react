import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "../lib/api";
import Loading from "../components/Loading";
import type { TournamentResult } from "../lib/types";

export default function TournamentsPage() {
  const query = useQuery({
    queryKey: ["tournaments"],
    queryFn: getTournaments,
  });

  if (query.isLoading) return <Loading />;

  const grouped = Object.values(
    (query.data ?? []).reduce<Record<string, TournamentResult[]>>(
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
          <span className="eyebrow">Histórico</span>
          <h1>Campeonatos</h1>
        </div>
      </div>

      <div className="card-grid">
        {grouped.map((rows) => (
          <article className="tournament-card" key={rows[0]?.name ?? rows[0]?.id}>
            <h3>{rows[0]?.name ?? "Campeonato"}</h3>

            {rows.map((row) => (
              <div className="podium-text" key={row.id}>
                <span>
                  {row.placement ?? "Participação"}: {row.player_name ?? "—"}
                </span>
                <strong>{row.points ?? 0} pts</strong>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
