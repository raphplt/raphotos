-- L'admin comptait les photos par album en rapatriant une ligne par photo.
-- Postgres sait le faire seul.

create or replace view public.album_photo_counts
with (security_invoker = on) as
select
	album_id,
	count(*)::int                                  as photo_count,
	count(*) filter (where published)::int         as published_count
from public.photos
where album_id is not null
group by album_id;
