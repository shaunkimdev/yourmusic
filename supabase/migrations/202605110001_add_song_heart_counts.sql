alter table public.songs
  add column if not exists heart_count integer not null default 0 check (heart_count >= 0);

alter table public.song_contacts
  add column if not exists heart_count integer not null default 0 check (heart_count >= 0);

update public.song_contacts contacts
set heart_count = songs.heart_count
from public.songs songs
where contacts.song_id = songs.id
  and contacts.heart_count <> songs.heart_count;

create or replace function public.increment_song_heart(target_song_id uuid)
returns table(song_id uuid, heart_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_song_id uuid;
  updated_heart_count integer;
begin
  update public.songs
  set heart_count = public.songs.heart_count + 1
  where id = target_song_id
    and status = 'active'
  returning id, public.songs.heart_count
    into updated_song_id, updated_heart_count;

  if updated_song_id is null then
    raise exception 'song_not_found';
  end if;

  update public.song_contacts
  set heart_count = updated_heart_count
  where song_contacts.song_id = updated_song_id;

  song_id := updated_song_id;
  heart_count := updated_heart_count;
  return next;
end;
$$;

grant execute on function public.increment_song_heart(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
