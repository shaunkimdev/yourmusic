create extension if not exists pgcrypto;

create table if not exists public.mood_categories (
  key text primary key,
  label_ko text not null,
  description text not null,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  artist text not null,
  title text not null,
  cover text not null default '🎵',
  cover_image text,
  cover_color text not null default '#C084FC',
  mood_key text not null references public.mood_categories(key),
  scene text not null,
  lyric text,
  spotify_track_id text,
  recommender_name text,
  recommender_age integer,
  recommender_city text,
  status text not null default 'active' check (status in ('active', 'hidden')),
  source text not null default 'user' check (source in ('seed', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.song_contacts (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  contact_type text not null check (contact_type in ('email', 'instagram', 'kakao', 'phone')),
  contact_value text not null,
  privacy_agreed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists songs_active_mood_created_idx
  on public.songs (status, mood_key, created_at desc);

create unique index if not exists songs_seed_artist_title_idx
  on public.songs (artist, title)
  where source = 'seed';

alter table public.mood_categories enable row level security;
alter table public.songs enable row level security;
alter table public.song_contacts enable row level security;

drop policy if exists "public can read mood categories" on public.mood_categories;
create policy "public can read mood categories"
  on public.mood_categories for select
  using (true);

drop policy if exists "public can read active songs" on public.songs;
create policy "public can read active songs"
  on public.songs for select
  using (status = 'active');

drop policy if exists "no public contact access" on public.song_contacts;

insert into public.mood_categories (key, label_ko, description, aliases) values
  ('nostalgic', '그리운', '옛 기억, 밤거리, 레트로, 회상에 어울리는 분위기', array['그리움','추억','옛날','레트로','네온','밤거리','nostalgic']),
  ('uplifting', '상쾌한', '기분 전환, 드라이브, 가벼운 설렘에 어울리는 분위기', array['상쾌','기분전환','드라이브','달리고','해변','uplifting']),
  ('melancholy', '쓸쓸한', '외로움, 겨울밤, 차분한 슬픔에 어울리는 분위기', array['쓸쓸','외로','우울','슬픔','겨울','혼자','melancholy']),
  ('summer', '여름', '바다, 햇살, 여름밤, 휴양지에 어울리는 분위기', array['여름','바다','해변','휴가','오키나와','summer']),
  ('romantic', '로맨틱한', '봄, 사랑, 설렘, 산책에 어울리는 분위기', array['사랑','연애','설렘','봄','벚꽃','romantic']),
  ('late-night', '늦은 밤', '자정 이후, 야경, 혼자 깨어 있는 시간에 어울리는 분위기', array['밤','새벽','야경','호텔','자정','late-night']),
  ('warm', '따뜻한', '비 오는 날, 카페, 포근한 위로에 어울리는 분위기', array['따뜻','포근','비','카페','커피','위로','warm']),
  ('energetic', '활기찬', '운동, 출근길, 에너지 충전, 빠른 리듬에 어울리는 분위기', array['신나는','활기','에너지','운동','출근','energetic'])
on conflict (key) do update set
  label_ko = excluded.label_ko,
  description = excluded.description,
  aliases = excluded.aliases;

insert into public.songs
  (artist, title, cover, cover_image, cover_color, mood_key, scene, lyric, spotify_track_id, recommender_name, recommender_age, recommender_city, source)
select *
from (values
  ('Mariya Takeuchi', 'Plastic Love', '🌃', 'https://picsum.photos/seed/plastic-love-citypop/320/320', '#FF6B9D', 'nostalgic', '한밤중 도쿄 시부야 횡단보도, 네온사인 아래 혼자 걷는 기분', '突然のキスや熱いまなざしで', '7rU6Iebxzlvqy5t857bKFq', '유진', 28, '서울', 'seed'),
  ('Tatsuro Yamashita', 'Ride on Time', '🌅', 'https://picsum.photos/seed/ride-on-time-sunset/320/320', '#FFB088', 'uplifting', '여름 해변도로를 차로 달리며 창문 내릴 때', 'Ride on time 時よ止まれ', '', 'Hiro', 31, '도쿄', 'seed'),
  ('검정치마', 'Antifreeze', '❄️', 'https://picsum.photos/seed/antifreeze-winter/320/320', '#7DD3FC', 'melancholy', '겨울밤 한강 산책로, 입김이 보이는 거리', '얼지말고 있어줘', '31JwlIZJjlUzcemnVi8bdO', '민지', 25, '부산', 'seed'),
  ('Anri', 'Last Summer Whisper', '🌊', 'https://picsum.photos/seed/last-summer-whisper/320/320', '#00D4FF', 'summer', '오키나와 해변에서 수평선 너머 일몰을 바라볼 때', 'Last summer whisper, 風になりたい', '38LUbz74v3nmP8x0efElw2', '소희', 27, '제주', 'seed'),
  ('새소년', '난춘', '🌸', 'https://picsum.photos/seed/nanchun-spring/320/320', '#FFB6C1', 'romantic', '벚꽃 흩날리는 봄날 오후, 친구와 자전거 타는 길', '봄이 와도 그 곳은 여전한가요', '320twJYO0LC64eWCuCC5vj', '재현', 24, '서울', 'seed'),
  ('Miki Matsubara', 'Stay With Me', '🌙', 'https://picsum.photos/seed/stay-with-me-night/320/320', '#C084FC', 'late-night', '12시가 넘은 도쿄 야경을 호텔 창문에서 바라볼 때', '真夜中のドアをたたき', '5DCLkzuWICNar6qn3B393f', '유나', 29, '인천', 'seed'),
  ('잔나비', '주저하는 연인들을 위해', '☕', 'https://picsum.photos/seed/jannabi-cafe-rain/320/320', '#FFF4D6', 'warm', '비 오는 날 오래된 LP 카페에서 따뜻한 커피 한 잔', '나는 읽기 쉬운 마음이야', '5BqwC9kOBbqYkzdOKeXFFk', '도윤', 26, '대구', 'seed'),
  ('Casiopea', 'Asayake', '🌇', 'https://picsum.photos/seed/asayake-dawn-city/320/320', '#FF1493', 'energetic', '새벽 5시, 도시의 첫 해가 빌딩 사이로 떠오를 때', '(instrumental)', '1yQmKOIJE13EcFPIWQS2Pw', 'Kenji', 33, '오사카', 'seed')
) as seed_songs(artist, title, cover, cover_image, cover_color, mood_key, scene, lyric, spotify_track_id, recommender_name, recommender_age, recommender_city, source)
where not exists (
  select 1
  from public.songs songs
  where songs.source = 'seed'
    and songs.artist = seed_songs.artist
    and songs.title = seed_songs.title
);
