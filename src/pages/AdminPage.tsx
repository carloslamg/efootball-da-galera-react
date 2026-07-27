import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPlayers, isAdmin } from "../lib/api";
import { supabase } from "../lib/supabase";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";

export default function AdminPage(){
 const qc=useQueryClient(); const admin=useQuery({queryKey:["is-admin"],queryFn:isAdmin}); const players=useQuery({queryKey:["players"],queryFn:getPlayers});
 const [p1,setP1]=useState(""); const [p2,setP2]=useState(""); const [g1,setG1]=useState(0); const [g2,setG2]=useState(0); const [summary,setSummary]=useState(""); const [notice,setNotice]=useState("");
 const add=useMutation({
  mutationFn:async()=>{
   if(!p1||!p2||p1===p2)throw new Error("Escolha jogadores diferentes.");
   const a=players.data?.find(p=>String(p.id)===p1); const b=players.data?.find(p=>String(p.id)===p2);
   const {error}=await supabase.from("matches").insert({player1_id:Number(p1),player1_name:a?.name,goals1:g1,player2_id:Number(p2),player2_name:b?.name,goals2:g2,summary});
   if(error)throw error;
  },
  onSuccess:async()=>{setNotice("Partida cadastrada.");await Promise.all([qc.invalidateQueries({queryKey:["matches"]}),qc.invalidateQueries({queryKey:["players"]})])},
  onError:(e:Error)=>setNotice(e.message)
 });
 if(admin.isLoading||players.isLoading)return <Loading/>; if(!admin.data)return <ErrorBox message="Acesso negado. Entre com sua conta administradora."/>;
 return <section><div className="page-heading"><div><span className="eyebrow">Gestão</span><h1>Painel Admin</h1></div></div>
 <form className="panel admin-form" onSubmit={(e:FormEvent)=>{e.preventDefault();add.mutate()}}>
 <label>Jogador 1<select value={p1} onChange={e=>setP1(e.target.value)} required><option value="">Selecione</option>{(players.data??[]).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
 <label>Jogador 2<select value={p2} onChange={e=>setP2(e.target.value)} required><option value="">Selecione</option>{(players.data??[]).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
 <div className="two-cols"><label>Gols 1<input type="number" min="0" value={g1} onChange={e=>setG1(Number(e.target.value))}/></label><label>Gols 2<input type="number" min="0" value={g2} onChange={e=>setG2(Number(e.target.value))}/></label></div>
 <label>Resumo<input value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Opcional"/></label>
 <button disabled={add.isPending}>Cadastrar</button></form>{notice&&<div className="notice">{notice}</div>}</section>
}
