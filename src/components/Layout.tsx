import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Crown, Home, LogIn, Medal, Shield, Swords, Trophy, Users } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

const nav = [
  ["/","Home",Home],["/ranking","Ranking",Trophy],["/jogadores","Jogadores",Users],
  ["/partidas","Partidas",Swords],["/campeonatos","Campeonatos",Medal],
  ["/estatisticas","Estatísticas",BarChart3],["/hall-da-fama","Hall da Fama",Crown],
  ["/admin","Admin",Shield],
] as const;

export default function Layout(){
  const [session,setSession]=useState<Session|null>(null);
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const {data:listener}=supabase.auth.onAuthStateChange((_e,next)=>setSession(next));
    return ()=>listener.subscription.unsubscribe();
  },[]);
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-badge">eF</div><div><strong>eFootball</strong><span>da Galera</span></div></div>
      <nav>{nav.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==="/"}><Icon size={19}/>{label}</NavLink>)}</nav>
      <button className="ghost-button" onClick={()=>session?supabase.auth.signOut():location.assign("/login")}><LogIn size={18}/>{session?"Sair":"Entrar"}</button>
    </aside>
    <main className="content"><Outlet/></main>
  </div>
}
