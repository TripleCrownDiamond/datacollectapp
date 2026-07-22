# 20 — Modèles de déploiement, confidentialité & modularité

Ce document décrit **comment la plateforme est livrée et hébergée**, comment la **base de données est rendue modulaire**, et comment la **confidentialité des données** est garantie selon le mode choisi. Il prolonge [09_ARCHITECTURE](09_ARCHITECTURE.md).

## 1. Principe : une seule base de code, plusieurs modes de déploiement

Le produit est **le même partout** ([P1](17_PRINCIPES_CONCEPTION.md) : pas de fork par client). Ce qui change est **où tourne le backend** et **où vivent les données**. Le mobile et le web s'adaptent en pointant vers l'URL du backend configuré.

```
                     ┌─────────────────────────────────────────────┐
                     │            Une seule base de code            │
                     │   apps/api · apps/web · apps/mobile · pkgs   │
                     └─────────────────────────────────────────────┘
                                        │ configuration
      ┌───────────────┬────────────────┼─────────────────┬──────────────────┐
      ▼               ▼                 ▼                 ▼                  ▼
  SaaS cloud     Auto-hébergé      Web / PWA         App bureau         Mobile
 (notre infra)  (serveur client)  (navigateur)     (Tauri/Electron)   (Android/iOS)
```

## 2. Les 4 modes de déploiement

| Mode | Pour qui | Où sont les données | Version |
|---|---|---|---|
| **SaaS (cloud)** | La majorité : ONG, chercheurs, PME qui veulent démarrer vite | Notre plateforme (Supabase managé, région UE par défaut) | V1 |
| **Auto-hébergé** | Organisations soucieuses de souveraineté (gouvernements, bailleurs, données sensibles) qui **ne veulent pas de plateforme en ligne tierce** | 100 % sur le serveur du client | ENT |
| **PWA / Web installable** | Superviseurs, contrôleurs qualité, analystes sur poste ; collecte d'appoint sans store | Selon le backend pointé | V1 (web) / V2 (PWA offline complète) |
| **Application bureau** (Tauri/Electron) | Postes bureautiques Windows/macOS/Linux ; environnements sans navigateur moderne | Selon le backend pointé | V2 |

### BYO key (Bring Your Own Key)

Sur tous les modes, l'utilisateur peut fournir **ses propres clés** pour certains services, ce qui déplace le coût variable vers son infrastructure :

- **Clé IA** (Anthropic) : l'utilisateur branche sa propre clé API. Les appels IA partent vers le fournisseur LLM avec sa clé. Applicable sur le free tier SaaS, le Pro et l'auto-hébergé. Signalé explicitement lors de la configuration.
- **Clé tuiles satellite** : l'utilisateur fournit sa clé MapTiler/Mapbox/Stadia/Bing pour des fonds de carte haute résolution. Le défaut sans clé (OpenFreeMap, EOX Sentinel-2) reste disponible.
- **Stockage S3 personnalisé** (auto-hébergé Enterprise) : le client utilise son propre bucket S3-compatible (MinIO, Wasabi, Backblaze).

Le BYO key est un **levier clé du free tier soutenable** : le coût IA/tuiles est chez l'utilisateur, pas chez nous. Voir [21_MONETISATION §3](21_MONETISATION.md).

### 2.1 SaaS (cloud) — défaut
Notre infrastructure gère tout (Supabase, API, stockage, IA, sauvegardes, mises à jour). Le client crée un compte et démarre. Multi-tenant isolé par `organization_id` ([10_DATABASE §6](10_DATABASE.md)). Hébergement UE par défaut, autres régions en option.

### 2.2 Auto-hébergé (self-hosted) — souveraineté totale
Pour les clients qui **refusent l'hébergement en ligne tiers**. Livraison d'une **pile Docker Compose / Helm** complète : API, base (Supabase self-hosted ou Postgres+PostGIS), stockage (MinIO), Redis, web. Le client héberge sur son propre serveur / cloud privé ; **aucune donnée ne sort de chez lui**. L'IA est optionnelle : soit désactivée, soit branchée sur la clé du client (l'appel part vers le fournisseur LLM choisi — signalé explicitement). Mises à jour par images versionnées ; documentation d'exploitation fournie. Licence Enterprise ([21_MONETISATION](21_MONETISATION.md)).

### 2.3 PWA / Web installable
L'app web est une **PWA** installable (icône bureau/écran d'accueil, plein écran). Cible : superviseurs et analystes. La collecte offline complète en PWA (stockage local IndexedDB, service worker, sync) arrive en V2 — l'app mobile native reste la référence terrain pour la robustesse hors ligne.

### 2.4 Application bureau
Empaquetage **Tauri** (léger, recommandé) ou Electron de l'app web, pour distribuer un exécutable Windows/macOS/Linux. Même code que le web ; utile pour les postes hors navigateur ou les déploiements contrôlés.

## 3. Base de données modulaire (famille PostgreSQL/PostGIS)

L'accès aux données passe par une **couche repository abstraite** ([09_ARCHITECTURE §3bis](09_ARCHITECTURE.md)) : l'hébergement de la base est choisi par configuration (`DATA_DRIVER`) sans toucher au métier. On reste dans la **famille PostgreSQL + PostGIS** pour préserver 100 % du SIG serveur, quel que soit le mode.

| Cible | Statut | Recommandé pour |
|---|---|---|
| **Supabase (Postgres+PostGIS managé)** | **Défaut** | SaaS et la plupart des cas |
| Postgres+PostGIS **self-hosted** (Docker) | Pleinement supporté | Auto-hébergé, souveraineté |
| Neon / RDS / Aurora Postgres | Pleinement supporté | Clients déjà sur AWS/cloud managé |

**Ce qui est modulaire** : l'endroit où tourne la base (notre cloud vs serveur client vs cloud du client) et le fournisseur managé. **Ce qui reste constant** : Postgres 16 + PostGIS, donc aucune perte de fonctionnalité géospatiale entre les modes. Le stockage médias suit la même logique : S3-compatible (MinIO en self-hosted, S3/R2/Supabase Storage en SaaS).

**Stratégie de portage.** Un adaptateur = une implémentation des interfaces de repository + un jeu de migrations Prisma. Le **contrat de conformité** (mêmes tests sur chaque cible) garantit un comportement identique. La couche repository laisse la porte ouverte à d'autres moteurs si un besoin réel émerge, mais ce n'est pas au programme : la valeur est la portabilité **d'hébergement**, pas le changement de moteur.

## 4. Le mobile s'adapte à toutes les configurations

L'application mobile est **agnostique du backend** : à la configuration (ou via QR de connexion fourni par l'organisation), elle pointe vers l'URL de l'API — **notre cloud** ou **le serveur du client auto-hébergé**. Une même app installée peut servir plusieurs organisations sur des backends différents. Rien dans l'app n'est codé en dur vers notre cloud. Conséquence : un client auto-hébergé utilise **la même app des stores**, simplement connectée à son serveur.

## 5. Confidentialité & conformité selon le mode

| Garantie | SaaS | Auto-hébergé |
|---|---|---|
| Données au repos | chiffrées, région UE (défaut) | chez le client, sous son contrôle total |
| Isolation | multi-tenant par `organization_id` + tests d'isolation | mono-tenant physique |
| IA | opt-out par org ; champs sensibles exclus ; sous-traitant LLM documenté | désactivable, ou clé/fournisseur du client |
| Export / suppression RGPD | à la demande, par org | maîtrisé par le client |
| Sauvegardes | PITR gérées par nous | procédure fournie, opérées par le client |
| Chiffrement mobile local | SecureStore (secrets) ; SQLCipher en ENT | idem |

Dans tous les modes : TLS en transit, audit log immuable ([10_DATABASE §7](10_DATABASE.md)), minimisation des données. Le mode auto-hébergé est la réponse aux exigences de **souveraineté** (données qui ne quittent jamais l'infrastructure du client). Détail sécurité & conformité : [24_SECURITE_CONFORMITE](24_SECURITE_CONFORMITE.md).

## 6. Coûts par mode

Les coûts d'infrastructure, d'installation auto-hébergée, d'IA et le coût total de possession (TCO) par plan sont détaillés dans **[23_COUTS](23_COUTS.md)**.

## 7. Impact roadmap

- **V1** : SaaS sur Supabase ; couche repository en place dès le départ (ne pas coupler le métier à Supabase) ; web installable (PWA de base).
- **V2** : app bureau (Tauri), PWA offline complète, durcissement de l'adaptateur Postgres self-hosted.
- **ENT** : distribution auto-hébergée packagée (Docker/Helm) + doc d'exploitation ; SQLCipher mobile.

> La modularité d'hébergement de la base et l'agnosticité du backend sont des **exigences d'architecture dès la V1** (couche repository, aucune URL en dur), même si l'auto-hébergement packagé n'arrive qu'en ENT. Reporter ces choix coûterait un refactor majeur.
