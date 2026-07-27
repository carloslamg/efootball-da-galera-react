import { useQuery } from "@tanstack/react-query";
import { getMatches, getPlayers } from "../lib/api";
import Loading from "../components/Loading";

export default function HomePage(){
  const players=useQuery({queryKey:["players"],queryFn:getPlayers});
  const matches=useQuery({queryKey:["matches"],queryFn:getMatches});
  if(players.isLoading||matches.isLoading)return <Loading/>;
  return <>
    <section className="hero"><span className="pill">Temporada em andamento</span><h1>eFootball <em>da Galera</em></h1><p>Ranking, partidas e campeonatos dos amigos em um só lugar.</p></section>
    <section><h2>Top 3</h2><div className="card-grid three">
      {(players.data??[]).slice(0,3).map((p,i)=><div className="ranking-card" key={p.id}><span className="position">{i+1}</span><div><h3>{p.name}</h3><p>{p.wins}V · {p.draws}E · {p.losses}D</p></div><strong>{p.points}</strong></div>)}
    </div></section>
    <section><h2>Últimas partidas</h2><div className="stack">
      {(matches.data??[]).slice(0,5).map(m=><div className="match-row" key={m.id}><span>{m.player1_name}</span><strong>{m.goals1??0} × {m.goals2??0}</strong><span>{m.player2_name}</span></div>)}
      {(matches.data??[]).length===0&&<div className="empty">Nenhuma partida registrada.</div>}
    </div></section>
  </>
}
