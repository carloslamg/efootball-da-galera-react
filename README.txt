ATUALIZAÇÃO DE GESTÃO DE JOGADORES

1. Execute no Supabase:
   supabase/player_management_patch.sql

2. Copie/substitua no projeto:
   src/lib/types.ts
   src/lib/api.ts
   src/pages/AdminPage.tsx

3. Copie:
   src/player-management.css

4. Abra src/main.tsx e adicione esta linha logo depois de:
   import "./styles.css";

   import "./player-management.css";

5. GitHub Desktop:
   Summary: Add player management
   Commit to main
   Push origin

O botão Excluir funciona assim:
- jogador sem histórico: exclui permanentemente;
- jogador com partidas, pontos ou campeonatos: desativa para preservar os dados.
