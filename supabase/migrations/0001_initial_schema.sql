-- Raphotos — schéma initial
-- Albums, photos, likes, commentaires modérés et vidéos.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- albums

create table if not exists public.albums (
	id             uuid primary key default gen_random_uuid(),
	slug           text not null unique,
	title          text not null,
	season         text,
	year           integer,
	description    text,
	cover_photo_id uuid,
	sort_order     integer not null default 0,
	published      boolean not null default false,
	created_at     timestamptz not null default now(),
	updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------- photos

create table if not exists public.photos (
	id            uuid primary key default gen_random_uuid(),
	slug          text not null unique,
	album_id      uuid references public.albums(id) on delete set null,
	width         integer not null,
	height        integer not null,
	lqip          text,
	title         text,
	caption       text,
	original_ext  text not null default 'jpg',
	taken_at      timestamptz,
	camera        text,
	lens          text,
	iso           integer,
	aperture      numeric(4,1),
	shutter_speed numeric(12,8),
	focal_length  numeric(6,1),
	gps_lat       numeric(9,6),
	gps_lng       numeric(9,6),
	file_hash     text not null unique,
	published     boolean not null default true,
	sort_order    integer not null default 0,
	created_at    timestamptz not null default now(),
	updated_at    timestamptz not null default now()
);

create index if not exists photos_album_idx
	on public.photos (album_id, sort_order);
create index if not exists photos_published_idx
	on public.photos (published, taken_at desc);

alter table public.albums
	drop constraint if exists albums_cover_photo_fk;
alter table public.albums
	add constraint albums_cover_photo_fk
	foreign key (cover_photo_id) references public.photos(id) on delete set null;

-- ---------------------------------------------------------------- likes

create table if not exists public.likes (
	id         uuid primary key default gen_random_uuid(),
	photo_id   uuid not null references public.photos(id) on delete cascade,
	visitor_id text not null,
	created_at timestamptz not null default now(),
	unique (photo_id, visitor_id)
);

create index if not exists likes_photo_idx on public.likes (photo_id);

-- ------------------------------------------------------------- commentaires

do $$ begin
	create type public.comment_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

create table if not exists public.comments (
	id          uuid primary key default gen_random_uuid(),
	photo_id    uuid not null references public.photos(id) on delete cascade,
	author_name text not null check (char_length(trim(author_name)) between 2 and 40),
	body        text not null check (char_length(trim(body)) between 2 and 1000),
	status      public.comment_status not null default 'pending',
	ip_hash     text,
	created_at  timestamptz not null default now()
);

create index if not exists comments_photo_status_idx
	on public.comments (photo_id, status, created_at desc);
create index if not exists comments_moderation_idx
	on public.comments (status, created_at desc);

-- ---------------------------------------------------------------- vidéos

create table if not exists public.videos (
	id          uuid primary key default gen_random_uuid(),
	youtube_id  text not null unique,
	title       text not null,
	description text,
	published   boolean not null default true,
	sort_order  integer not null default 0,
	created_at  timestamptz not null default now()
);

-- ------------------------------------------------------- compteurs agrégés

-- Évite un N+1 sur les grilles : une seule jointure pour likes + commentaires.
-- security_invoker : sans cette option la vue s'exécuterait avec les droits de
-- son propriétaire et contournerait silencieusement les politiques RLS.
create or replace view public.photo_stats
with (security_invoker = on) as
select
	p.id as photo_id,
	coalesce(l.like_count, 0)::int    as like_count,
	coalesce(c.comment_count, 0)::int as comment_count
from public.photos p
left join (
	select photo_id, count(*) as like_count
	from public.likes group by photo_id
) l on l.photo_id = p.id
left join (
	select photo_id, count(*) as comment_count
	from public.comments where status = 'approved' group by photo_id
) c on c.photo_id = p.id;

-- --------------------------------------------------- mise à jour updated_at

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
	new.updated_at = now();
	return new;
end $$;

drop trigger if exists albums_touch on public.albums;
create trigger albums_touch before update on public.albums
	for each row execute function public.touch_updated_at();

drop trigger if exists photos_touch on public.photos;
create trigger photos_touch before update on public.photos
	for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------------- RLS
-- Lecture publique limitée au contenu publié. Toutes les écritures passent
-- par le serveur avec la clé service, qui contourne RLS : aucune politique
-- d'insertion n'est donc exposée au client anonyme.

alter table public.albums   enable row level security;
alter table public.photos   enable row level security;
alter table public.likes    enable row level security;
alter table public.comments enable row level security;
alter table public.videos   enable row level security;

drop policy if exists "albums lisibles si publiés" on public.albums;
create policy "albums lisibles si publiés" on public.albums
	for select using (published = true);

drop policy if exists "photos lisibles si publiées" on public.photos;
create policy "photos lisibles si publiées" on public.photos
	for select using (published = true);

drop policy if exists "likes lisibles" on public.likes;
create policy "likes lisibles" on public.likes
	for select using (true);

drop policy if exists "commentaires approuvés lisibles" on public.comments;
create policy "commentaires approuvés lisibles" on public.comments
	for select using (status = 'approved');

drop policy if exists "vidéos lisibles si publiées" on public.videos;
create policy "vidéos lisibles si publiées" on public.videos
	for select using (published = true);
