-- Les albums importés avec --album (ou depuis un dossier sans « Saison_Année »)
-- ont été insérés avec season et year à null : ils se retrouvaient relégués en
-- fin de galerie. On les reconstruit depuis leur titre.

update public.albums
set
	season = coalesce(season, case
		when title ~* '^(printemps|spring)'        then 'Spring'
		when title ~* '^([eé]t[eé]|summer)'        then 'Summer'
		when title ~* '^(automne|fall|autumn)'     then 'Fall'
		when title ~* '^(hiver|winter)'            then 'Winter'
	end),
	year = coalesce(year, substring(title from '\d{4}')::int)
where
	(season is null or year is null)
	and title ~* '^(printemps|spring|[eé]t[eé]|summer|automne|fall|autumn|hiver|winter)'
	and title ~ '\d{4}';
