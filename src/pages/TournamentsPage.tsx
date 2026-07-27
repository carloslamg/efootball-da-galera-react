import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "../lib/api";
import Loading from "../components/Loading";
export default function TournamentsPage(){
 const q=useQuery({queryKey:["tournaments"],queryFn:getTournaments}); if(q.isLoading)return <Loading/>;
 const grouped=Object.values((q.data??[]).reduce<Record<string, any[]>>((acc,row)=>{const k=row.name||"Campeonato";(acc[k]??=[]).push(row);return acc},{}));
 return <section><div className="page-heading"><div><span className="eyebrow">Histórico</span><h1>Campeonatos</h1></div></div>
 <div className="card-grid">{grouped.map((rows:any[])=><article className="tournament-card" key={rows[0].name}><h3>{rows[0].name}</h3>{rows.map(r=><div className="podium-text" key={r.id}><span>{r.placement}: {r.player_name}</span><strong>{r.points??0} pts</strong></div>)}</article>)}</div></section>
}
