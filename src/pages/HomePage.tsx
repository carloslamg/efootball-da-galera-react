import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Crown,
  Medal,
  Swords,
  Trophy,
} from "lucide-react";
import { getChampionships, getMatches, getPlayers } from "../lib/api";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import "../lovable-home.css";

export default function HomePage() {
  const players = useQuery({
    queryKey: ["players"],
    queryFn: getPlayers,
  });

  const matches = useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
  });

  const championships = useQuery({
    queryKey: ["championships"],
    queryFn: getChampionships,
  });

  if (players.isLoading || matches.isLoading || championships.isLoading) {
    return <Loading />;
  }

  if (players.error || matches.error || championships.error) {
    return <ErrorBox message="Não foi possível carregar a página inicial." />;
  }

  const ranking = players.data ?? [];
  const latestMatches = (matches.data ?? []).slice(0, 4);
  const latestChampionships = (championships.data ?? [])
    .filter((item) => item.status === "finished")
    .slice(0, 4);

  return (
    <div className="lovable-home">
      <section className="lovable-home-hero">
        <span>Temporada em andamento</span>
        <h1>
          eFootball <em>da Galera</em>
        </h1>
        <p>Ranking, partidas, campeonatos e o Hall da Fama dos amigos.</p>
      </section>

      <section className="lovable-home-section">
        <div className="section-heading">
          <div>
            <Trophy size={23} />
            <h2>Top 3</h2>
          </div>
          <Link to="/ranking">Ver tudo →</Link>
        </div>

        <div className="top-three-grid">
          {ranking.slice(0, 3).map((player, index) => (
            <article
              className={`top-player-card ${index === 0 ? "leader" : ""}`}
              key={player.id}
            >
              <span className="rank-watermark">{index + 1}</span>

              <div className="top-player-header">
                <div className="top-player-avatar">
                  {player.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3>{player.name}</h3>
                  <p>
                    {player.wins}V · {player.draws}E · {player.losses}D
                  </p>
                </div>
              </div>

              <div className="top-player-footer">
                <div>
                  <strong>{player.points}</strong>
                  <span>PONTOS</span>
                </div>

                <small>
                  🏆 {player.titles} · SG{" "}
                  {player.goals_for - player.goals_against}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-two-columns">
        <div className="lovable-home-section">
          <div className="section-heading">
            <div>
              <Swords size={23} />
              <h2>Últimos jogos</h2>
            </div>
            <Link to="/partidas">Ver tudo →</Link>
          </div>

          <div className="home-list-card">
            {latestMatches.length === 0 ? (
              <div className="home-empty">Nenhuma partida registrada.</div>
            ) : (
              latestMatches.map((match) => (
                <div className="home-match-row" key={match.id}>
                  <span>{match.player1_name}</span>
                  <strong>
                    {match.goals1 ?? 0} × {match.goals2 ?? 0}
                  </strong>
                  <span>{match.player2_name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lovable-home-section">
          <div className="section-heading">
            <div>
              <Crown size={23} />
              <h2>Últimos campeões</h2>
            </div>
            <Link to="/campeonatos">Ver tudo →</Link>
          </div>

          <div className="home-list-card">
            {latestChampionships.length === 0 ? (
              <div className="home-empty">
                Nenhum campeonato registrado.
              </div>
            ) : (
              latestChampionships.map((championship) => (
                <div className="home-champion-row" key={championship.id}>
                  <div>
                    <strong>{championship.name}</strong>
                    <span>
                      {new Date(championship.played_at).toLocaleDateString(
                        "pt-BR",
                      )}
                    </span>
                  </div>
                  <Medal size={20} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="lovable-home-section">
        <div className="section-heading">
          <div>
            <Trophy size={23} />
            <h2>Ranking resumido</h2>
          </div>
          <Link to="/ranking">Ver tudo →</Link>
        </div>

        <div className="home-ranking-table">
          <div className="home-ranking-head">
            <span>#</span>
            <span>Jogador</span>
            <span>Pontos</span>
            <span>V</span>
            <span>SG</span>
          </div>

          {ranking.slice(0, 8).map((player, index) => (
            <div className="home-ranking-row" key={player.id}>
              <span>{index + 1}</span>
              <strong>{player.name}</strong>
              <b>{player.points}</b>
              <span>{player.wins}</span>
              <span>{player.goals_for - player.goals_against}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
