import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "../lib/api";
import Loading from "../components/Loading";
export default function PlayersPage(){
 const q=useQuery({queryKey:["players"],queryFn:getPlayers}); if(q.isLoading)return <Loading/>;
 return <section><div className="page-heading"><div><span className="eyebrow">Elenco</span><h1>Jogadores</h1></div></div>
 <div className="card-grid">{(q.data??[]).map(p=><article className="player-card" key={p.id}><div className="avatar">{p.name[0]}</div><h3>{p.name}</h3><p>{p.points} pontos</p><div className="mini-stats"><span>{p.wins}V</span><span>{p.draws}E</span><span>{p.losses}D</span></div></article>)}</div></section>
}
