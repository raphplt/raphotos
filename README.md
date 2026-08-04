# Raphotos

Galerie photo personnelle — Next.js 16 (App Router), Tailwind 4, Supabase et
Cloudflare R2.

## Architecture

```
Navigateur ──▶ Vercel (Next.js, RSC + ISR)
                 ├─▶ Supabase Postgres  albums · photos · likes · comments · videos
                 └─▶ R2 (CDN)           photos/{slug}/{thumb|grid|full}.avif
                                        photos/{slug}/original.jpg
```

Les images ne sont **pas** versionnées : elles vivent sur R2, en trois variantes
AVIF pré-générées, servies via un loader `next/image` personnalisé
(`src/lib/image-loader.ts`). L'optimiseur d'images de Vercel n'est donc jamais
sollicité.

## Démarrage

```bash
npm install
cp .env.example .env   # puis compléter les variables
npm run dev
```

Le site se construit même sans base configurée : les pages affichent alors des
états vides.

## Base de données

Appliquer `supabase/migrations/0001_initial_schema.sql` dans l'éditeur SQL du
tableau de bord Supabase (ou via la CLI). Le schéma installe les tables, la vue
d'agrégats `photo_stats` et les politiques RLS (lecture publique restreinte au
contenu publié ; toutes les écritures passent par le serveur).

## Importer des photos

```bash
npm run import -- "/chemin/vers/le/dossier"
npm run import -- "/chemin/vers/la/racine" --recursive   # un album par sous-dossier
npm run import -- "/chemin" --dry-run                    # simulation
```

Le script lit les EXIF, génère les variantes et le placeholder flou, envoie le
tout sur R2 puis insère les lignes dans Supabase. Il est **idempotent** :
l'empreinte SHA-256 du fichier sert de clé, on peut donc le relancer sans créer
de doublon.

Options : `--album <nom>`, `--force`, `--concurrency <n>`.

## Administration

`/admin`, accessible par lien magique envoyé à l'adresse `ADMIN_EMAIL`.
Permet de publier ou dépublier les photos (c'est là que se fait le tri
éditorial), d'éditer titres et légendes, de gérer les albums et les vidéos, et
de modérer les commentaires.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run import` | Import de photos vers R2 + Supabase |
