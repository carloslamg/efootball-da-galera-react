# eFootball da Galera — versão compatível com o banco antigo

Esta versão usa exatamente a estrutura atual do seu Supabase:

- `players.id`: bigint
- `matches.id`: bigint
- `tournaments.id`: bigint
- `points_history.id`: bigint
- autenticação/permissões: uuid

## Ordem correta

1. No Supabase correto (`xxjfkpvbzravvgcujrqx`), execute:
   `supabase/patch_existing_schema.sql`
2. Copie `.env.example` para `.env.local`.
3. Preencha a publishable key.
4. Rode:
   `npm install`
   `npm run dev`
5. Envie ao GitHub e publique no Vercel.

O script preserva dados existentes e não recria as tabelas.
