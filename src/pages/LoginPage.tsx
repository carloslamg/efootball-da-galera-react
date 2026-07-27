import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
export default function LoginPage(){
 const nav=useNavigate(); const [email,setEmail]=useState("carlos.lamg@hotmail.com"); const [password,setPassword]=useState(""); const [msg,setMsg]=useState("");
 async function submit(e:FormEvent){e.preventDefault();setMsg("Entrando...");const {error}=await supabase.auth.signInWithPassword({email,password});if(error)return setMsg(error.message);nav("/admin")}
 return <div className="login-page"><form className="login-card" onSubmit={submit}><div className="brand-badge">eF</div><h1>Área administrativa</h1>
 <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
 <button type="submit">Entrar</button>{msg&&<p>{msg}</p>}</form></div>
}
