import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "../lib/api";
import Loading from "../components/Loading";
export default function RankingPage(){
  const q=useQuery({queryKey:["players"],queryFn:getPlayers});
  if(q.isLoading)return <Loading/>;
  return <section><div className="page-heading"><div><span className="eyebrow">Classificação geral</span><h1>Ranking</h1></div></div>
  <div className="table-wrap"><table><thead><tr><th>#</th><th>Jogador</th><th>Pontos</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>Títulos</th></tr></thead>
  <tbody>{(q.data??[]).map((p,i)=><tr key={p.id}><td>{i+1}</td><td><strong>{p.name}</strong></td><td className="accent">{p.points}</td><td>{p.wins}</td><td>{p.draws}</td><td>{p.losses}</td><td>{p.goals_for}</td><td>{p.goals_against}</td><td>{p.titles}</td></tr>)}</tbody></table></div></section>
}
