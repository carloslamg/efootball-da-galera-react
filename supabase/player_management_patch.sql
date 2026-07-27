-- Gestão segura de jogadores para o banco existente.
-- Permite renomear, ativar/desativar e excluir permanentemente
-- apenas quando o jogador não possui histórico relacionado.

alter table public.players
add column if not exists active boolean not null default true;

create or replace function public.delete_player_safely(_player_id bigint)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  _has_history boolean;
begin
  if not public.is_admin() then
    raise exception 'Acesso negado';
  end if;

  select exists (
    select 1 from public.matches
    where player1_id = _player_id or player2_id = _player_id

    union all

    select 1 from public.points_history
    where player_id = _player_id

    union all

    select 1 from public.tournaments
    where player_id = _player_id
  )
  into _has_history;

  if _has_history then
    update public.players
    set active = false
    where id = _player_id;

    return 'deactivated';
  end if;

  delete from public.players
  where id = _player_id;

  return 'deleted';
end;
$$;

grant execute on function public.delete_player_safely(bigint)
to authenticated;

notify pgrst, 'reload schema';
