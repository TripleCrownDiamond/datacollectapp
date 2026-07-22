# 10 — Base de données

PostgreSQL 16 + PostGIS. Migrations via Prisma (`apps/api`), SQL brut pour les objets PostGIS et index avancés. Conventions : tables et colonnes en anglais snake_case ; PK = `id uuid` (v7) ; horodatage `created_at` / `updated_at` (trigger) partout ; **soft delete** (`deleted_at`) sur toutes les tables métier ; toutes les tables métier portent `organization_id` (multi-tenant, cf. [09_ARCHITECTURE.md §4](09_ARCHITECTURE.md)).

## 1. Schéma — identité et organisation

```sql
users (
  id uuid PK, email citext UNIQUE, password_hash text,        -- argon2id
  full_name text, locale text DEFAULT 'fr',
  email_verified_at timestamptz, disabled_at timestamptz,
  created_at, updated_at
)

organizations (
  id uuid PK, slug text UNIQUE, name text,
  plan text DEFAULT 'free',            -- free | pro | enterprise
  settings jsonb DEFAULT '{}',         -- options org (ai_enabled, retention…)
  created_at, updated_at, deleted_at
)

memberships (
  id uuid PK, organization_id uuid FK, user_id uuid FK,
  role_id uuid FK roles,               -- rôle au niveau organisation
  invited_by uuid FK users, joined_at timestamptz,
  UNIQUE (organization_id, user_id)
)

roles (                                -- presets système (org NULL) + rôles custom (par org)
  id uuid PK, organization_id uuid FK NULL, key text, name text,
  is_preset bool DEFAULT false,        -- super_admin | admin | project_lead |
                                       -- supervisor | qa | collector | analyst | observer
  created_at, updated_at
)

role_permissions (                     -- permissions atomiques d'un rôle
  role_id uuid FK, permission text,    -- ex. 'form.publish', 'submission.review',
                                       -- 'data.export', 'ai.use', 'collect'…
  PRIMARY KEY (role_id, permission)
)

project_members (                      -- affinage du rôle au niveau projet (optionnel)
  id uuid PK, organization_id uuid FK, project_id uuid FK, user_id uuid FK,
  role_id uuid FK roles,               -- surcharge le rôle org pour ce projet
  created_at, UNIQUE (project_id, user_id)
)

invitations (
  id uuid PK, organization_id uuid FK, email citext, role text,
  token text UNIQUE, expires_at timestamptz, accepted_at timestamptz,
  created_by uuid FK users, created_at
)

refresh_tokens (
  id uuid PK, user_id uuid FK, token_hash text, device_info text,
  expires_at timestamptz, revoked_at timestamptz, created_at
)
```

## 2. Schéma — projets et formulaires

```sql
projects (
  id uuid PK, organization_id uuid FK,
  name text, description text,
  status text DEFAULT 'draft',         -- draft | active | archived
  languages text[] DEFAULT '{fr}', timezone text DEFAULT 'UTC',
  settings jsonb DEFAULT '{}',         -- gps_accuracy_m, photo_max_px,
                                       -- attachment_max_mb, approval_required…
  created_by uuid FK users, created_at, updated_at, deleted_at
)

forms (
  id uuid PK, organization_id uuid FK, project_id uuid FK,
  name text, status text DEFAULT 'draft',     -- draft | published | archived
  current_version int DEFAULT 0,              -- dernière version publiée (0 = jamais)
  draft_schema jsonb,                          -- brouillon en cours d'édition
  created_by uuid FK users, created_at, updated_at, deleted_at
)

form_versions (                                -- IMMUABLE après insertion
  id uuid PK, organization_id uuid FK, form_id uuid FK,
  version int, schema jsonb,                   -- FormSchema complet (voir §5)
  published_by uuid FK users, published_at timestamptz,
  UNIQUE (form_id, version)
)

form_assignments (
  id uuid PK, organization_id uuid FK, form_id uuid FK,
  user_id uuid FK,                             -- NULL = tous les collecteurs du projet
  created_at, UNIQUE (form_id, user_id)
)
```

## 3. Schéma — soumissions et médias

```sql
submissions (
  id uuid PK,                          -- UUID v7 généré par le CLIENT (idempotence)
  organization_id uuid FK, project_id uuid FK,
  form_id uuid FK, form_version int,   -- version exacte utilisée
  submitted_by uuid FK users,
  data jsonb,                          -- réponses {variable: valeur}
  status text DEFAULT 'submitted',     -- submitted | approved | rejected | conflict
  revision int DEFAULT 1,
  rejection_reason text, reviewed_by uuid FK users, reviewed_at timestamptz,
  geom geometry(Point, 4326),          -- dénormalisé : 1re réponse GPS (carte rapide)
  meta jsonb,                          -- device, app_version, duration_s,
                                       -- started_at, finalized_at (heure client)…
  quality_flags jsonb DEFAULT '[]',    -- flags IA/règles (AI-03/04, GIS-07)
  created_at, updated_at, deleted_at
)

submission_revisions (                 -- historique avant chaque révision (D4)
  id uuid PK, organization_id uuid FK, submission_id uuid FK,
  revision int, data jsonb, meta jsonb, created_at
)

attachments (
  id uuid PK,                          -- UUID client
  organization_id uuid FK, submission_id uuid FK,
  question_name text, file_name text, mime_type text, size_bytes bigint,
  storage_key text,                    -- org/{org}/submissions/{sub}/{att}
  status text DEFAULT 'declared',      -- declared | uploading | stored | failed
  received_bytes bigint DEFAULT 0,     -- reprise des chunks
  checksum_sha256 text, created_at, updated_at
)
```

## 4. Schéma — SIG, IA, système

```sql
geo_features (                          -- couches de référence, placettes, transects…
  id uuid PK, organization_id uuid FK, project_id uuid FK,
  layer text,                           -- nom de couche (ex. 'parcelles', 'placettes')
  kind text,                            -- reference | plot | transect | buffer | geofence
  name text, properties jsonb DEFAULT '{}',
  geom geometry(Geometry, 4326),
  source_import_id uuid,                -- traçabilité import (V2)
  created_by uuid FK users, created_at, updated_at, deleted_at
)

ai_jobs (
  id uuid PK, organization_id uuid FK, created_by uuid FK users,
  kind text,                            -- form_generation | quality_check | translate…
  status text DEFAULT 'queued',         -- queued | running | succeeded | failed
  input jsonb, output jsonb, error text,
  model text, tokens_in int, tokens_out int, cost_usd numeric(10,5),
  created_at, started_at timestamptz, finished_at timestamptz
)

export_jobs (
  id uuid PK, organization_id uuid FK, project_id uuid FK, created_by uuid FK,
  kind text,                            -- csv | xlsx | geojson | media_zip…
  filters jsonb, status text, storage_key text, error text,
  created_at, finished_at timestamptz
)

audit_log (                             -- append-only (pas d'UPDATE/DELETE, revoke SQL)
  id bigint identity PK, organization_id uuid, user_id uuid,
  action text,                          -- ex. 'form.publish', 'submission.reject',
                                        -- 'member.role_change', 'export.create', 'ai.call'
  entity_type text, entity_id uuid, details jsonb, ip inet,
  created_at timestamptz DEFAULT now()
)

sync_cursors (
  organization_id uuid, user_id uuid, device_id text,
  last_pulled_at timestamptz, last_pushed_at timestamptz,
  PRIMARY KEY (user_id, device_id)
)
```

## 5. FormSchema (contenu de `form_versions.schema`)

Défini et validé par `packages/form-engine` (schéma zod exporté). Structure :

```jsonc
{
  "version": 1,                      // version du format de schéma (pas du formulaire)
  "defaultLanguage": "fr",
  "languages": ["fr", "en"],
  "settings": { "displayMode": "step" },
  "children": [
    { "type": "section", "name": "identification", "label": {"fr": "Identification"},
      "children": [
        { "type": "text", "name": "village", "label": {"fr": "Village"},
          "required": true, "hint": {"fr": "…"} },
        { "type": "select_one", "name": "sexe", "label": {"fr": "Sexe"},
          "options": [ {"name": "m", "label": {"fr": "Homme"}},
                       {"name": "f", "label": {"fr": "Femme"}} ] },
        { "type": "integer", "name": "age", "label": {"fr": "Âge"},
          "constraints": { "min": 0, "max": 120,
                           "message": {"fr": "Âge entre 0 et 120"} } },
        { "type": "geopoint", "name": "position", "required": true,
          "params": { "minAccuracyM": 10 } },
        { "type": "photo", "name": "photo_maison",
          "relevance": { "op": "and", "conditions": [
            { "question": "sexe", "operator": "=", "value": "f" } ] } }
      ] },
    { "type": "repeat", "name": "membres", "label": {"fr": "Membres du ménage"},
      "children": [ /* … */ ] },
    { "type": "calculate", "name": "nb_membres", "formula": "count(membres)" }
  ]
}
```

Types V1 : `text`, `integer`, `decimal`, `date`, `time`, `select_one`, `select_multiple`, `geopoint`, `photo`, `audio`, `signature`, `note`, `calculate`, `section`, `repeat`. Opérateurs de `relevance` : `=`, `!=`, `<`, `<=`, `>`, `>=`, `contains`, `empty`, `not_empty` ; combinaisons `and`/`or` imbriquables. Règles : `name` = slug unique global au formulaire ; une relevance ne référence que des questions antérieures ; cycles interdits (validés à la publication).

Format des réponses (`submissions.data`) : `{ "village": "Ndiaye", "sexe": "f", "age": 34, "position": {"lat": .., "lng": .., "accuracy": .., "alt": ..}, "photo_maison": "<attachment_uuid>", "membres": [ {…}, {…} ] }`.

## 6. Rôles et permissions (RBAC configurable)

Le modèle est **basé sur les permissions** : un rôle est un **preset de permissions**, et les permissions sont **configurables** par organisation (rôles personnalisés possibles en plus des presets). Source de vérité des permissions atomiques : `packages/shared/permissions.ts`.

### 8 rôles (presets)

| Rôle | Portée | Vocation |
|---|---|---|
| **Super Administrateur** | plateforme (multi-org) | administration de l'instance ; pertinent surtout en auto-hébergement/Enterprise ([12_ROADMAP](12_ROADMAP.md)) |
| **Administrateur** | organisation | gère l'org, les membres, les rôles, la facturation, tous les projets |
| **Chef de projet** | projet(s) | crée/pilote ses projets, formulaires, équipe, workflow |
| **Superviseur** | projet(s) | supervise la collecte, assigne, suit l'avancement, voit toutes les soumissions du projet |
| **Contrôleur qualité** | projet(s) | consulte, approuve/rejette, traite les flags qualité ; ne modifie pas les formulaires |
| **Agent collecteur** | projet(s) | collecte (mobile) ; ne voit que **ses** soumissions |
| **Analyste** | projet(s) | accès lecture + analyse/exports/rapports ; pas de gestion ni de collecte |
| **Observateur** | projet(s) | lecture seule (dashboards, cartes) ; ni export ni action |

Modèle : `roles` (presets système + rôles custom par org) → `role_permissions` (permissions atomiques) ; l'appartenance `memberships.role` référence un rôle. Les permissions sont **assignables au niveau organisation et affinables au niveau projet** (`project_members` avec rôle par projet).

### Matrice preset → permissions

| Permission | Super Admin | Admin | Chef projet | Superviseur | Contrôleur | Agent | Analyste | Observateur |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Administrer la plateforme (multi-org) | ✅ | — | — | — | — | — | — | — |
| Gérer l'org, facturation, membres, rôles | ✅ | ✅ | — | — | — | — | — | — |
| Créer/archiver/supprimer des projets | ✅ | ✅ | ✅(siens) | — | — | — | — | — |
| Créer/éditer/publier des formulaires (+ XLSForm) | ✅ | ✅ | ✅ | — | — | — | — | — |
| Assigner formulaires/placettes, gérer l'équipe projet | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| Voir toutes les soumissions du projet | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Approuver / rejeter (contrôle qualité) | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — |
| Collecter (mobile), voir **ses** soumissions | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | — |
| Analyser, exporter, générer des rapports | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | — |
| Utiliser l'IA (génération, assistant, contrôle) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅(assistant terrain) | ✅ | — |
| Lecture des dashboards / cartes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Règles : hiérarchie indicative Super Admin ⊃ Admin ⊃ Chef de projet ⊃ Superviseur ⊃ {Contrôleur, Analyste} ⊃ Observateur ; l'Agent collecteur est transversal (seule voie mobile). Chaque org peut **cloner un preset et ajuster ses permissions** (rôle custom). Les permissions personnalisées ne peuvent jamais élargir au-delà de ce que le plan autorise.

Isolation : chaque requête est scopée `organization_id` (guard global) ; les agents collecteurs sont en plus filtrés `submitted_by = user_id`. Tests d'isolation inter-tenants **et** inter-rôles obligatoires par module.

## 7. Index et intégrité

```sql
-- Requêtes fréquentes
CREATE INDEX ON submissions (organization_id, project_id, form_id, created_at DESC);
CREATE INDEX ON submissions (submitted_by, created_at DESC);
CREATE INDEX ON submissions (form_id, status);
CREATE INDEX submissions_data_gin ON submissions USING gin (data jsonb_path_ops);
CREATE INDEX submissions_geom_gix ON submissions USING gist (geom);
CREATE INDEX geo_features_geom_gix ON geo_features USING gist (geom);
CREATE INDEX ON audit_log (organization_id, created_at DESC);
CREATE INDEX ON attachments (submission_id);
```

- FK avec `ON DELETE RESTRICT` (le soft delete est la voie normale) ; `deleted_at IS NULL` dans tous les index partiels de listes.
- Contraintes CHECK sur les enums de statut ; trigger `updated_at` ; trigger d'immuabilité sur `form_versions` et `audit_log` (REVOKE UPDATE/DELETE).
- Sauvegardes : PITR (WAL) en production, test de restauration mensuel documenté.

## 8. Volumétrie et évolution

- Dimensionnement V1 : 10⁶ soumissions totales sans partitionnement. Au-delà (V3) : partitionnement de `submissions` par `organization_id` hash ou par date, à décider sur métriques réelles.
- Les colonnes dénormalisées (`geom`, compteurs par formulaire via vues matérialisées pour les dashboards) sont recalculables depuis `data` — script de réconciliation fourni.
