import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import RankingPage from "./pages/RankingPage";
import PlayersPage from "./pages/PlayersPage";
import MatchesPage from "./pages/MatchesPage";
import TournamentsPage from "./pages/TournamentsPage";
import StatsPage from "./pages/StatsPage";
import HallPage from "./pages/HallPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";

export default function App(){
  return <Routes>
    <Route path="/login" element={<LoginPage/>}/>
    <Route element={<Layout/>}>
      <Route index element={<HomePage/>}/>
      <Route path="/ranking" element={<RankingPage/>}/>
      <Route path="/jogadores" element={<PlayersPage/>}/>
      <Route path="/partidas" element={<MatchesPage/>}/>
      <Route path="/campeonatos" element={<TournamentsPage/>}/>
      <Route path="/estatisticas" element={<StatsPage/>}/>
      <Route path="/hall-da-fama" element={<HallPage/>}/>
      <Route path="/admin" element={<AdminPage/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>
}
