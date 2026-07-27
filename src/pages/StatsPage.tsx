import { useQuery } from "@tanstack/react-query";
import { getMatches, getPlayers } from "../lib/api";
import Loading from "../components/Loading";
import StatCard from "../components/StatCard";
export default function StatsPage(){
 const players=useQuery({queryKey:["players"],queryFn:getPlayers}); const matches=useQuery({queryKey:["matches"],queryFn:getMatches});
 if(players.isLoading||matches.isLoading)return <Loading/>;
 const totalGoals=(matches.data??[]).reduce((s,m)=>s+(m.goals1??0)+(m.goals2??0),0);
 return <section><div className="page-heading"><div><span className="eyebrow">Números</span><h1>Estatísticas</h1></div></div><div className="card-grid three">
 <StatCard label="Partidas" value={matches.data?.length??0}/><StatCard label="Gols" value={totalGoals}/>
 <StatCard label="Média de gols" value={(matches.data?.length??0)?(totalGoals/(matches.data?.length??1)).toFixed(2):"0"}/>
 <StatCard label="Líder" value={players.data?.[0]?.name??"—"}/>
 <StatCard label="Mais vitórias" value={[...(players.data??[])].sort((a,b)=>b.wins-a.wins)[0]?.name??"—"}/>
 <StatCard label="Mais títulos" value={[...(players.data??[])].sort((a,b)=>b.titles-a.titles)[0]?.name??"—"}/>
 </div></section>
}
