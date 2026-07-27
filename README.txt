ATUALIZAÇÃO: ADMIN NO ESTILO LOVABLE

1. Execute no Supabase:
   supabase/lovable_admin_patch.sql

2. Substitua no projeto:
   src/lib/types.ts
   src/lib/api.ts
   src/pages/AdminPage.tsx

3. Copie:
   src/lovable-admin.css

4. No arquivo src/main.tsx, adicione:
   import "./lovable-admin.css";

   logo abaixo de:
   import "./styles.css";

5. Faça Commit e Push no GitHub Desktop:
   Summary: Add Lovable style admin

6. O Vercel fará o deploy automaticamente.

O novo Admin terá:
- abas Partida, Campeonato, Jogadores e Temporadas;
- amistoso ou campeonato;
- temporada;
- seleção de campeonato;
- data da partida;
- gestão de jogadores;
- criação de temporadas;
- criação e encerramento de campeonatos.
