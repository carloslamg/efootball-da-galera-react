-- Compatível com o banco antigo (IDs bigint).
-- Não apaga dados existentes.

create extension if not exists pgcrypto;

-- Relacionamentos bigint.
do $$ begin
  alter table public.matches
    add constraint matches_player1_id_fkey foreign key (player1_id) references public.players(id) on delete set null;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.matches
    add constraint matches_player2_id_fkey foreign key (player2_id) references public.players(id) on delete set null;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.points_history
    add constraint points_history_player_id_fkey foreign key (player_id) references public.players(id) on delete cascade;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.tournaments
    add constraint tournaments_player_id_fkey foreign key (player_id) references public.players(id) on delete cascade;
exception when duplicate_object then null;
end $$;

-- Segurança.
create or replace function public.has_role(check_user_id uuid, check_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(select 1 from public.user_roles where user_id=check_user_id and role=check_role);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select public.has_role(auth.uid(),'admin'::public.app_role);
$$;

grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Atualiza ranking automaticamente ao inserir/editar/excluir partidas.
create or replace function public.recalculate_player_stats()
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  update public.players p
  set
    wins = coalesce(s.wins,0),
    draws = coalesce(s.draws,0),
    losses = coalesce(s.losses,0),
    goals_for = coalesce(s.goals_for,0),
    goals_against = coalesce(s.goals_against,0)
  from (
    select
      p2.id,
      count(*) filter (
        where (m.player1_id=p2.id and coalesce(m.goals1,0)>coalesce(m.goals2,0))
           or (m.player2_id=p2.id and coalesce(m.goals2,0)>coalesce(m.goals1,0))
      )::int as wins,
      count(*) filter (where coalesce(m.goals1,0)=coalesce(m.goals2,0))::int as draws,
      count(*) filter (
        where (m.player1_id=p2.id and coalesce(m.goals1,0)<coalesce(m.goals2,0))
           or (m.player2_id=p2.id and coalesce(m.goals2,0)<coalesce(m.goals1,0))
      )::int as losses,
      coalesce(sum(case when m.player1_id=p2.id then m.goals1 else m.goals2 end),0)::int as goals_for,
      coalesce(sum(case when m.player1_id=p2.id then m.goals2 else m.goals1 end),0)::int as goals_against
    from public.players p2
    left join public.matches m on m.player1_id=p2.id or m.player2_id=p2.id
    group by p2.id
  ) s
  where p.id=s.id;
end;
$$;

create or replace function public.apply_match_points()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  p1_points int := 0;
  p2_points int := 0;
begin
  if tg_op='DELETE' then
    delete from public.points_history where reason='match:'||old.id::text;
    perform public.recalculate_player_stats();
    update public.players p
    set points=coalesce((select sum(ph.points) from public.points_history ph where ph.player_id=p.id),0);
    return old;
  end if;

  delete from public.points_history where reason='match:'||new.id::text;

  if coalesce(new.goals1,0)>coalesce(new.goals2,0) then
    p1_points:=5;
  elsif coalesce(new.goals2,0)>coalesce(new.goals1,0) then
    p2_points:=5;
  else
    p1_points:=2;
    p2_points:=2;
  end if;

  insert into public.points_history(player_id,player_name,points,reason)
  values
    (new.player1_id,new.player1_name,p1_points,'match:'||new.id::text),
    (new.player2_id,new.player2_name,p2_points,'match:'||new.id::text);

  perform public.recalculate_player_stats();

  update public.players p
  set points=coalesce((select sum(ph.points) from public.points_history ph where ph.player_id=p.id),0);

  return new;
end;
$$;

drop trigger if exists trg_apply_match_points on public.matches;
create trigger trg_apply_match_points
after insert or update or delete on public.matches
for each row execute procedure public.apply_match_points();

-- RLS.
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.points_history enable row level security;
alter table public.tournaments enable row level security;

drop policy if exists "players readable by everyone" on public.players;
create policy "players readable by everyone" on public.players for select to public using(true);
drop policy if exists "admins manage players" on public.players;
create policy "admins manage players" on public.players for all to authenticated using(public.is_admin()) with check(public.is_admin());

drop policy if exists "matches readable by everyone" on public.matches;
create policy "matches readable by everyone" on public.matches for select to public using(true);
drop policy if exists "admins manage matches" on public.matches;
create policy "admins manage matches" on public.matches for all to authenticated using(public.is_admin()) with check(public.is_admin());

drop policy if exists "points readable by everyone" on public.points_history;
create policy "points readable by everyone" on public.points_history for select to public using(true);
drop policy if exists "admins manage points" on public.points_history;
create policy "admins manage points" on public.points_history for all to authenticated using(public.is_admin()) with check(public.is_admin());

drop policy if exists "tournaments readable by everyone" on public.tournaments;
create policy "tournaments readable by everyone" on public.tournaments for select to public using(true);
drop policy if exists "admins manage tournaments" on public.tournaments;
create policy "admins manage tournaments" on public.tournaments for all to authenticated using(public.is_admin()) with check(public.is_admin());

-- Jogadores sem duplicação.
insert into public.players(name)
values ('Gaushow'),('André'),('Kauã'),('Thiago'),('Fell'),('Agnaldo'),('Phael'),('Felipe'),('Rafael'),('Higor')
on conflict do nothing;

-- Garante admin.
insert into public.profiles(id,email,display_name)
select id,email,'Carlos' from auth.users
where lower(email)=lower('carlos.lamg@hotmail.com')
on conflict(id) do update set email=excluded.email;

insert into public.user_roles(user_id,role)
select id,'admin'::public.app_role from auth.users
where lower(email)=lower('carlos.lamg@hotmail.com')
on conflict(user_id,role) do nothing;

select public.recalculate_player_stats();
update public.players p
set points=coalesce((select sum(ph.points) from public.points_history ph where ph.player_id=p.id),0);

notify pgrst,'reload schema';
