# 11 — API

Contrat REST de `apps/api`. Base : `https://api.<domaine>/v1`. Ce document est **contractuel** : toute divergence code/doc doit être corrigée dans la même PR. Une spec OpenAPI est générée automatiquement depuis les schémas zod (`@anatine/zod-openapi`) et publiée sur `/v1/openapi.json` (+ Swagger UI en staging).

## 1. Conventions

- JSON UTF-8 ; dates ISO 8601 UTC ; géométries GeoJSON (SRID 4326) ; IDs UUID.
- Auth : `Authorization: Bearer <access_token>` (mobile et appels API) ; cookies httpOnly + CSRF pour la session web.
- Scoping : toutes les routes (hors `/auth`) sont implicitement scopées à l'organisation du token ; le rôle est vérifié selon la matrice [10_DATABASE.md §6](10_DATABASE.md).
- Pagination : `?page[size]=50&page[cursor]=<opaque>` → réponse `{ data: [...], meta: { nextCursor, total? } }`. Tri `?sort=-created_at`. Filtres `?filter[status]=approved&filter[from]=2026-01-01`.
- Idempotence : les créations issues du mobile utilisent l'UUID client comme identifiant (POST rejoué = 200 avec la ressource existante, jamais 409).
- Rate limits : `/auth/*` 10/min/IP ; global 300/min/compte ; en-têtes `X-RateLimit-*`.

## 2. Erreurs (format unique)

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Le champ age est invalide",
             "details": [{ "path": "data.age", "rule": "max", "message": "…" }],
             "requestId": "req_..." } }
```

Codes : `VALIDATION_ERROR` 422 · `UNAUTHORIZED` 401 · `FORBIDDEN` 403 · `NOT_FOUND` 404 · `CONFLICT` 409 · `RATE_LIMITED` 429 · `PAYLOAD_TOO_LARGE` 413 · `INTERNAL` 500. La liste complète vit dans `packages/shared/errors.ts`.

## 3. Auth

| Méthode | Route | Description |
|---|---|---|
| POST | `/auth/register` | `{email, password, fullName, organizationName}` → crée user (owner) + org ; envoie l'email de vérification |
| POST | `/auth/login` | `{email, password}` → `{accessToken, refreshToken, user, organizations[]}` |
| POST | `/auth/refresh` | `{refreshToken}` → nouveaux tokens (rotation ; réutilisation détectée = révocation de la famille) |
| POST | `/auth/logout` | révoque le refresh token |
| POST | `/auth/forgot-password`, `/auth/reset-password` | flux standard par email |
| GET | `/auth/me` | profil + memberships |
| POST | `/auth/verify-email` | `{token}` |

## 4. Organisations et membres

| Méthode | Route | Rôle min | Description |
|---|---|---|---|
| GET/PATCH | `/organization` | membre / owner | lire / modifier l'org courante |
| GET | `/members` | admin | liste des membres (rôle, activité) |
| PATCH | `/members/:userId` | admin | changer rôle ; `{disabled: true}` pour désactiver |
| POST | `/invitations` | admin | `{email, role}` → envoi d'invitation (expire 7 j) |
| POST | `/invitations/accept` | public | `{token, password?, fullName?}` |
| DELETE | `/invitations/:id` | admin | révoquer |

## 5. Projets

| Méthode | Route | Rôle min | Description |
|---|---|---|---|
| GET | `/projects` | membre | liste (les collectors ne voient que les projets où ils sont assignés) |
| POST | `/projects` | admin | `{name, description?, languages, timezone}` |
| GET/PATCH | `/projects/:id` | membre / admin | détail (compteurs inclus) / modification, statut, `settings` |
| DELETE | `/projects/:id` | owner | soft delete, confirmation par nom côté client |

## 6. Formulaires

| Méthode | Route | Rôle min | Description |
|---|---|---|---|
| GET | `/projects/:id/forms` | membre | liste (statut, version courante, compteurs) |
| POST | `/projects/:id/forms` | editor | `{name, draftSchema?}` |
| GET | `/forms/:id` | membre | détail + `draftSchema` |
| PATCH | `/forms/:id` | editor | maj brouillon (auto-save du builder) |
| POST | `/forms/:id/publish` | editor | valide via form-engine → crée `form_versions` n+1 ; 422 avec détails si invalide |
| GET | `/forms/:id/versions` · `/forms/:id/versions/:v` | membre | historique / schéma exact d'une version |
| GET/PUT | `/forms/:id/assignments` | editor | lire / remplacer les assignations (`{userIds: []}` ou `{all: true}`) |
| POST | `/forms/:id/duplicate` | editor | copie en brouillon |
| POST | `/forms/import/xlsform` | editor | upload `.xlsx` → FormSchema (brouillon) + rapport de conformité ([18_XLSFORM](18_XLSFORM.md)) |
| GET | `/forms/:id/export/xlsform` | editor | FormSchema → `.xlsx` conforme, réimportable Kobo/ODK |

> Import Word/PDF (via IA) : voir `/ai/form-generation` (§11). Rôles : « editor » désigne ici tout rôle disposant de la permission `form.publish` — voir la matrice [10_DATABASE §6](10_DATABASE.md).

## 7. Soumissions

| Méthode | Route | Rôle min | Description |
|---|---|---|---|
| GET | `/projects/:id/submissions` | editor (collector : les siennes) | pagination cursor, filtres `form`, `status`, `from/to`, `submittedBy`, `q` (plein texte), `bbox` (geo) |
| GET | `/submissions/:uuid` | idem | détail : `data`, meta, révisions, attachments (avec URLs présignées), flags qualité |
| POST | `/submissions/:uuid/review` | editor | `{action: "approve" \| "reject", reason?}` (reason obligatoire si reject) |
| GET | `/projects/:id/submissions/stats` | membre | agrégats dashboard : compteurs, série temporelle, répartitions par question (`?questions=sexe,village`) |

La création de soumissions passe par `/sync` (§9) — y compris pour d'éventuels clients tiers.

## 8. Attachments (médias)

| Méthode | Route | Description |
|---|---|---|
| POST | `/attachments` | déclaration `{uuid, submissionUuid, questionName, fileName, mimeType, sizeBytes, checksumSha256}` → 201 (ou 200 si déjà déclaré) |
| GET | `/attachments/:uuid/status` | `{status, receivedBytes}` — point de reprise |
| PUT | `/attachments/:uuid/chunks/:n` | corps binaire (chunk 5 Mo, `Content-Range`) ; chunks réordonnables interdits : n séquentiel |
| POST | `/attachments/:uuid/complete` | vérifie taille + checksum → assemble → S3 → `{status: "stored"}` |
| GET | `/attachments/:uuid/download` | 302 vers URL présignée (15 min), selon permissions |

## 9. Synchronisation (mobile)

| Méthode | Route | Description |
|---|---|---|
| POST | `/sync/submissions` | lot ≤ 50 : `[{uuid, formId, formVersion, data, meta}]` → réponse par élément : `accepted` \| `already_synced` \| `rejected_invalid` (+ détails de validation form-engine) |
| PUT | `/sync/submissions/:uuid/revision` | correction post-rejet `{baseRevision, data, meta}` → `accepted` ou `conflict` (les deux versions conservées) |
| GET | `/sync/updates?since=<cursor>&deviceId=` | delta descendant : `{forms: [versions publiées], assignments, reviews: [{uuid, status, reason}], referenceData?, cursor}` |
| GET | `/sync/projects/:id/package` | paquet complet d'un projet pour premier téléchargement (formulaires + médias de formulaire + référentiels), avec `sizeBytes` estimé via `HEAD` |

## 10. SIG

| Méthode | Route | Version | Description |
|---|---|---|---|
| GET | `/projects/:id/geo/features?layer=&bbox=&kind=` | V1 | GeoJSON FeatureCollection paginée |
| POST | `/projects/:id/geo/features` | V2 | création (éditeur web) |
| POST | `/projects/:id/geo/import` | V2 | upload Shapefile/GeoJSON/KML/GPX → job ; `GET /geo/imports/:jobId` pour le rapport |
| POST | `/projects/:id/geo/plots/generate` | V2 | `{polygonFeatureId, mode: "grid"\|"random", spacingM?, count?, shape, radiusM?}` → placettes générées |
| GET | `/projects/:id/tiles/:z/:x/:y.mvt` | V2 | tuiles vectorielles des soumissions (clustering serveur) |

## 11. IA

Toutes asynchrones (jobs). Rôle min : editor. Voir [07_AI.md](07_AI.md).

| Méthode | Route | Description |
|---|---|---|
| POST | `/ai/form-generation` | `{description, languages, projectId, formId?}` → `{jobId}` |
| POST | `/ai/translate` (V2) | `{formId, targetLanguage}` → `{jobId}` |
| POST | `/ai/quality-check` (V2) | `{projectId, formId?, since?}` → `{jobId}` |
| POST | `/ai/chat` (V3) | `{projectId, message, conversationId?}` → `{jobId}` (réponse : texte + données + SQL inspectable) |
| GET | `/ai/jobs/:id` | `{status, output?, error?}` — poll (interval conseillé 2 s, `Retry-After`) |

## 12. Exports

| Méthode | Route | Description |
|---|---|---|
| POST | `/projects/:id/exports` | `{kind: "csv"\|"xlsx"\|"geojson"\|"spss"\|"stata"\|"pdf"\|"media_zip", filters}` → `{jobId}` |
| GET | `/exports/:jobId` | statut ; si `succeeded` → `downloadUrl` (présignée, 24 h) |

## 13. Analyse & rapports

Détail : [19_ANALYSE.md](19_ANALYSE.md). Rôle min : analyste (permission `data.analyze`).

| Méthode | Route | Description |
|---|---|---|
| GET | `/projects/:id/analysis/descriptive` | stats descriptives par question (`?questions=`, filtres) — calcul SQL |
| POST | `/projects/:id/analysis/crosstab` | `{rows, cols, measure}` → tableau croisé |
| POST | `/projects/:id/analysis/advanced` | `{method: "correlation"\|"regression"\|"anova"\|"timeseries", params}` → `{jobId}` (moteur stat asynchrone) |
| POST | `/projects/:id/reports` | `{template, filters}` → `{jobId}` rapport IA (résumé exécutif, technique, mission…) |
| GET | `/reports/:jobId` | statut + document généré (Markdown/PDF/DOCX) |

## 14. API publique & intégrations (ENT)

La plateforme est **ouverte** ([P10](17_PRINCIPES_CONCEPTION.md)) : toutes les ressources ci-dessus sont accessibles via clés d'API à scopes pour intégrer l'écosystème du client.

| Élément | Détail |
|---|---|
| Clés d'API | création/révocation, scopes par ressource (read/write), rattachées à un rôle |
| OpenAPI | spec complète sur `/v1/openapi.json` — génère des clients R, Python, etc. |
| Intégrations | **Power BI** (connecteur via API/export planifié), **R** & **Python** (packages d'exemple), **QGIS/ArcGIS** (GeoJSON/Shapefile/KML), **SPSS/Stata** (exports avec métadonnées) |
| Webhooks | `POST` sortant sur événements (`submission.created`, `submission.approved`…), signés HMAC |

Les métadonnées de formulaire (labels, types, choix) sont exposées avec les données pour reconstruire les variables côté outils tiers.

## 15. Versionnement de l'API

Préfixe `/v1` ; les changements cassants exigent `/v2` avec période de recouvrement ≥ 6 mois (les apps mobiles en production se mettent à jour lentement). Les champs additifs ne sont pas cassants ; les clients doivent ignorer les champs inconnus.
