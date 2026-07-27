import { useQuery } from "@tanstack/react-query";
import { getMatches } from "../lib/api";
import Loading from "../components/Loading";
export default function MatchesPage(){
 const q=useQuery({queryKey:["matches"],queryFn:getMatches}); if(q.isLoading)return <Loading/>;
 return <section><div className="page-heading"><div><span className="eyebrow">Histórico</span><h1>Partidas</h1></div></div>
 <div className="stack">{(q.data??[]).map(m=><article className="match-card" key={m.id}><div><span className="tag">Oficial</span><small>{new Date(m.created_at).toLocaleString("pt-BR")}</small></div><div className="score-line"><strong>{m.player1_name}</strong><b>{m.goals1??0} × {m.goals2??0}</b><strong>{m.player2_name}</strong></div>{m.summary&&<p>{m.summary}</p>}</article>)}</div></section>
}
