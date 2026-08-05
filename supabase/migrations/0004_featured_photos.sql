-- Photos candidates à la hero de la page d'accueil : une est tirée au sort
-- à chaque visite.

alter table public.photos
	add column if not exists featured boolean not null default false;

-- Index partiel : la sélection ne lit que les quelques lignes marquées.
create index if not exists photos_featured_idx
	on public.photos (featured)
	where featured and published;

-- Reprise de l'existant : l'album « FirstPage » servait déjà à ça.
update public.photos p
set featured = true
from public.albums a
where p.album_id = a.id
	and a.slug = 'firstpage'
	and p.published
	and not p.featured;
