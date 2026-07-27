import { useQuery } from "@tanstack/react-query";
import { getMatches, getPlayers } from "../lib/api";
import Loading from "../components/Loading";
export default function HallPage(){
 const players=useQuery({queryKey:["players"],queryFn:getPlayers}); const matches=useQuery({queryKey:["matches"],queryFn:getMatches});
 if(players.isLoading||matches.isLoading)return <Loading/>;
 const titles=[...(players.data??[])].sort((a,b)=>b.titles-a.titles)[0];
 const wins=[...(players.data??[])].sort((a,b)=>b.wins-a.wins)[0];
 const biggest=[...(matches.data??[])].sort((a,b)=>Math.abs((b.goals1??0)-(b.goals2??0))-Math.abs((a.goals1??0)-(a.goals2??0)))[0];
 return <section><div className="page-heading"><div><span className="eyebrow">Lendas</span><h1>Hall da Fama</h1></div></div><div className="card-grid three">
 <article className="hall-card"><span>👑</span><h3>Maior campeão</h3><strong>{titles?.name??"—"}</strong></article>
 <article className="hall-card"><span>⚡</span><h3>Mais vitórias</h3><strong>{wins?.name??"—"}</strong></article>
 <article className="hall-card"><span>🔥</span><h3>Maior goleada</h3><strong>{biggest?`${biggest.goals1} × ${biggest.goals2}`:"—"}</strong></article>
 </div></section>
}
