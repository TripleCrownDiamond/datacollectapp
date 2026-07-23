# 00 — Guide de l'agent développeur

Ce document est le **point d'entrée obligatoire** pour tout agent de développement autonome (et pour tout nouveau développeur). Il définit l'ordre de construction, les conventions et les critères de complétion. La documentation `docs/` est la **source de vérité** : en cas de doute, elle prime sur toute supposition.

> Voir aussi le [Guide de lecture](GUIDE_LECTURE.md) pour l'ordre de lecture complet. Les [10 principes de conception](17_PRINCIPES_CONCEPTION.md) arbitrent toute décision. Les [modules futurs](27_FUTURE_MODULES.md) définissent la vision d'extensibilité à garder en tête dès la conception.

## 1. Règles fondamentales

1. **Ne jamais inventer une exigence.** Toute fonctionnalité implémentée doit être traçable vers [02_PRD.md](02_PRD.md) ou [03_FEATURES.md](03_FEATURES.md). Si une exigence est ambiguë, choisir l'interprétation la plus simple compatible avec le PRD et les [principes](17_PRINCIPES_CONCEPTION.md), et la consigner (commentaire de PR + mise à jour de la doc).
2. **Respecter les contrats.** Le schéma de base de données ([10_DATABASE.md](10_DATABASE.md)) et le contrat d'API ([11_API.md](11_API.md)) sont contractuels. Les modifier exige une mise à jour de la doc dans la même PR.
3. **Offline-first n'est pas négociable.** Toute fonctionnalité mobile doit fonctionner sans réseau, sauf mention explicite « online only » dans la spec.
4. **TypeScript strict partout** (`strict: true`), pas de `any` non justifié.
5. **Doc = code.** Si le code s'écarte de la doc, la PR met à jour la doc.

## 2. Ordre de construction (phases)

Suivre cet ordre strictement — chaque phase produit une base testable pour la suivante. Le détail du périmètre par version est dans [12_ROADMAP.md](12_ROADMAP.md).

### Phase 0 — Fondations du monorepo
- Initialiser pnpm workspaces + Turborepo, ESLint + Prettier partagés, tsconfig de base.
- `infra/docker-compose.yml` : PostgreSQL 16 + PostGIS, MinIO, (optionnel) Redis.
- `packages/shared` : types de domaine + schémas zod (voir §4).
- CI GitHub Actions : lint, typecheck, tests sur chaque PR.

**Fait quand :** `pnpm install && pnpm build && pnpm test` passe à la racine ; `docker compose up` démarre la base.

### Phase 1 — Backend cœur (`apps/api`)
- NestJS + Prisma. Migrations reproduisant exactement le schéma de [10_DATABASE.md](10_DATABASE.md).
- Auth (register, login, refresh, RBAC) puis modules : organizations, projects, forms (avec versionnement), submissions, attachments (upload S3 presigné).
- Endpoints conformes à [11_API.md](11_API.md). Tests e2e par module (base de test dédiée).

**Fait quand :** tous les endpoints « V1 » de 11_API.md répondent conformément au contrat, tests e2e verts.

### Phase 2 — Moteur de formulaires (`packages/form-engine`)
- Modèle de formulaire JSON (défini en §5 de [10_DATABASE.md](10_DATABASE.md)), tous les types de questions V1.
- Évaluateur de logique conditionnelle (`relevance`), validation (`constraints`), calculs (`calculate`) avec mise à jour instantanée.
- **FormSchema conçu comme sur-ensemble de XLSForm** dès le départ ([18_XLSFORM.md](18_XLSFORM.md)) : prévoir l'évaluateur d'expressions et l'export XLSForm en V1 ; l'import et l'édition avancée arrivent en V2 mais le modèle ne doit pas les bloquer.
- Pur TypeScript sans dépendance UI — utilisé par le mobile, le web et l'API (validation serveur) ; alimente aussi les statistiques terrain offline ([05_MOBILE §2.12](05_MOBILE.md)).

**Fait quand :** couverture de tests unitaires sur chaque type de question, chaque opérateur de logique, les calculs/agrégations, et les cas limites (champs vides, dépendances circulaires rejetées) ; export XLSForm réimportable dans Kobo/ODK.

### Phase 3 — Plateforme web (`apps/web`)
- Next.js + Tailwind + shadcn/ui selon [06_WEB.md](06_WEB.md) et [13_DESIGN_SYSTEM.md](13_DESIGN_SYSTEM.md).
- Ordre : auth → gestion projets → form builder (manuel d'abord, IA ensuite) → table des soumissions → carte → dashboard.

**Fait quand :** un utilisateur peut créer un projet, construire un formulaire, inviter un membre, voir les soumissions en table et sur carte.

### Phase 4 — Application mobile (`apps/mobile`)
- Expo selon [05_MOBILE.md](05_MOBILE.md). Ordre : auth + téléchargement de projets → rendu de formulaire (form-engine) → capture média/GPS → stockage SQLite → file de synchronisation → historique.

**Fait quand :** le parcours complet fonctionne en mode avion : ouvrir un formulaire téléchargé, le remplir avec photo + GPS, l'enregistrer, puis synchroniser au retour du réseau.

### Phase 5 — IA (`apps/api` module `ai` + intégrations front)
- Selon [07_AI.md](07_AI.md) : génération de formulaires, puis contrôle qualité, puis chat avec les données.

### Phase 6 — SIG avancé
- Selon [08_GIS.md](08_GIS.md) : placettes, transects, buffers, import/export, cartes offline (MBTiles).

## 3. Conventions

| Sujet | Convention |
|---|---|
| Branches | `feat/<scope>-<slug>`, `fix/<scope>-<slug>` ; `main` protégée |
| Commits | Conventional Commits (`feat(api): …`, `fix(mobile): …`) |
| Nommage code | anglais (code, tables, API) ; UI et doc en français (i18n prête pour en/fr) |
| Tests | unitaires (Vitest/Jest) pour la logique ; e2e (Supertest) pour l'API ; composants critiques web (Testing Library) |
| Erreurs API | format unique, voir [11_API.md §2](11_API.md) |
| Identifiants | UUID v7 générés côté client (nécessaire pour l'offline), voir [09_ARCHITECTURE.md](09_ARCHITECTURE.md) |
| Dates | ISO 8601 UTC en base et API ; affichage localisé côté client |
| Géométries | GeoJSON dans l'API, `geometry` PostGIS (SRID 4326) en base |

## 4. `packages/shared` — le contrat partagé

Contient et exporte :
- Schémas **zod** de toutes les entités (User, Project, Form, FormSchema, Submission…) — utilisés pour valider côté client ET serveur.
- Types TypeScript inférés des schémas zod (jamais dupliqués à la main).
- Constantes : rôles, statuts, types de questions, codes d'erreur.
- Utilitaires purs partagés (formatage, i18n keys).

Toute évolution d'entité commence ici, puis se propage (migration Prisma → API → clients).

## 5. Definition of Done (toute PR)

- [ ] Lint + typecheck + tests verts en CI.
- [ ] Tests ajoutés pour la logique nouvelle (pas de logique métier non testée).
- [ ] Fonctionnalité traçable au PRD/Features ; doc mise à jour si le comportement ou un contrat change.
- [ ] Pas de secret en dur ; configuration via variables d'environnement (`.env.example` tenu à jour).
- [ ] Mobile : la fonctionnalité a été vérifiée en mode avion si elle touche la collecte.
- [ ] Accessibilité web : navigation clavier et labels sur tout élément interactif nouveau.

## 6. Environnement de développement

```bash
pnpm install            # dépendances
docker compose -f infra/docker-compose.yml up -d   # Postgres+PostGIS, MinIO
pnpm db:migrate         # migrations Prisma
pnpm db:seed            # données de démo (org, users, 2 formulaires, soumissions)
pnpm dev                # api + web en parallèle (turborepo)
pnpm --filter mobile start   # Expo
```

Variables d'environnement requises : voir `.env.example` de chaque app. La clé `ANTHROPIC_API_KEY` n'est requise que pour les fonctionnalités IA — tout le reste doit fonctionner sans.

## 7. Anti-patterns interdits

- Logique de formulaire dupliquée entre mobile et web (elle vit dans `form-engine`).
- Suppression physique de données métier (soft delete + audit, voir [10_DATABASE.md](10_DATABASE.md)).
- Appels IA bloquants dans le chemin critique de collecte ou de sync (l'IA est toujours asynchrone ou dégradable, voir [07_AI.md](07_AI.md)).
- Résolution de conflit de sync « silencieuse » qui écrase des données terrain (voir protocole en [09_ARCHITECTURE.md §6](09_ARCHITECTURE.md)).
